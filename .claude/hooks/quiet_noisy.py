#!/usr/bin/env python3
"""quiet_noisy.py - Claude Code PreToolUse hook: keep noisy command output out of context.

Hook mode (no args): reads the PreToolUse JSON on stdin. If the Bash command is an
install, build, test run or download, rewrites it to run through `run` mode below.
Everything else is left alone.

Run mode (`run -- <command>`): runs the original command unchanged, saves the full
output to a log, then prints:
  - the whole output, if it is short (<= 60 lines), otherwise
  - only error/failure lines (with a little context) + the final summary (last 25 lines),
    plus the path of the full log.
The exit code of the original command is preserved.

Opt out for one command: include CLAUDE_NOFILTER=1 in it.
Tune: QUIET_HOOK_SHORT_LINES (default 60), QUIET_HOOK_TAIL (default 25).
"""
import json, os, re, shlex, signal, subprocess, sys, tempfile, time

SELF = os.path.realpath(__file__)
USER_COPY = os.path.realpath(os.path.expanduser("~/.claude/hooks/quiet_noisy.py"))
SHORT_LINES = int(os.environ.get("QUIET_HOOK_SHORT_LINES", "60"))
TAIL = int(os.environ.get("QUIET_HOOK_TAIL", "25"))
MAX_IMPORTANT = 120
CONTEXT_AFTER = 3

# ---------------------------------------------------------------- what to catch
PM = r"(?:npm|pnpm|yarn|bun)"
NOISY = re.compile(r"(?:" + "|".join([
    # installs
    PM + r"\s+(?:install|i|ci|add|update|upgrade|rebuild)\b",
    r"composer\s+(?:install|update|require|upgrade|dump-autoload)\b",
    r"(?:pip3?|python3?\s+-m\s+pip)\s+install\b",
    r"uv\s+(?:sync|add|pip\s+install)\b",
    r"poetry\s+(?:install|update|add)\b",
    r"bundle\s+(?:install|update)\b",
    r"brew\s+(?:install|reinstall|upgrade|update)\b",
    r"(?:apt-get|apt)\s+(?:install|update|upgrade)\b",
    r"go\s+(?:mod\s+(?:download|tidy)|get|install)\b",
    r"cargo\s+(?:install|fetch|update)\b",
    r"npx\s+(?:-y\s+)?playwright\s+install\b",
    # builds
    PM + r"\s+(?:run\s+)?(?:build|compile|bundle)[\w:.-]*",
    r"(?:npx\s+)?(?:vite|next|nuxt|astro|tsup|parcel)\s+build\b",
    r"(?:npx\s+)?(?:webpack|rollup|esbuild)\b",
    r"cargo\s+build\b", r"go\s+build\b", r"make\b", r"cmake\s+--build\b",
    r"docker(?:\s+compose|-compose)?\s+(?:build|pull)\b",
    r"(?:\./)?(?:gradlew|gradle|mvn)\b", r"xcodebuild\b",
    # test runs
    PM + r"\s+(?:run\s+)?test[\w:.-]*",
    r"(?:npx\s+)?(?:jest|vitest|mocha|ava|cypress\s+run|playwright\s+test)\b",
    r"(?:python3?\s+-m\s+)?pytest\b", r"tox\b",
    r"(?:\./)?vendor/bin/(?:phpunit|pest|paratest)\b", r"(?:phpunit|pest)\b",
    r"php\s+artisan\s+(?:test|dusk)\b",
    r"cargo\s+test\b", r"go\s+test\b", r"(?:bundle\s+exec\s+)?(?:rspec|rake\s+(?:test|spec))\b",
    r"(?:\./)?(?:test|run-tests|run_tests)\.sh\b",
    # progress bars / downloads
    r"git\s+(?:clone|lfs\s+pull)\b", r"wget\b",
    r"curl\b.*\s(?:-\w*[oO]|--output|--remote-name)\b",
]) + r")")

# long-running / interactive things we never wrap (output would be held back)
NEVER = re.compile(r"(?:--watch\b|(?<![-\w:])(?:watch|dev|serve|start)\b|tail\s+-f|--ui\b|\bnohup\b|&\s*$)")
# segments that are fine to sit next to a noisy command (cd x && npm test)
HARMLESS = re.compile(r"^(?:cd\s+(?:\"[^\"]*\"|'[^']*'|\S+)|cd|export\s+\w+=\S*|\w+=\S*|set\s+-\w+|source\s+\S+|\.\s+\S+|nvm\s+use(?:\s+\S+)?|true)$")
PREFIX = re.compile(r"^(?:(?:\w+=\S*|sudo|time|command|env)\s+)+")


def segments(cmd):
    return [s.strip() for s in re.split(r"&&|\|\||;|\n", cmd) if s.strip()]


def should_wrap(cmd):
    if "CLAUDE_NOFILTER" in cmd or "quiet_noisy.py" in cmd:
        return False
    if "|" in cmd.replace("||", "") or "<<" in cmd or "`" in cmd or "$(" in cmd:
        return False  # already piped/filtered or too clever to rewrite safely
    if re.search(r"(?<![0-9&])>(?!&)", cmd.replace("2>&1", "")):
        return False  # stdout already redirected somewhere
    noisy = False
    for seg in segments(cmd):
        core = PREFIX.sub("", seg)
        if NOISY.match(core):
            if NEVER.search(core):
                return False
            noisy = True
        elif not HARMLESS.match(seg):
            return False  # only wrap pure install/build/test commands
    return noisy


def hook():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    # a repo copy defers to the user-level install when both exist (hooks run in parallel)
    if SELF != USER_COPY and os.path.exists(USER_COPY):
        return 0
    if data.get("tool_name") != "Bash":
        return 0
    ti = dict(data.get("tool_input") or {})
    cmd = ti.get("command") or ""
    if ti.get("run_in_background") or not should_wrap(cmd):
        return 0
    ti["command"] = "python3 %s run -- %s" % (shlex.quote(SELF), shlex.quote(cmd))
    # no permissionDecision: the rewritten command still goes through normal permissions
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "updatedInput": ti}}))
    return 0


# ---------------------------------------------------------------- what to keep
ANSI = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b[()][AB012]")
IMPORTANT = re.compile(
    r"(?i)(\berr(?:or|ors|!)?\b|\bfail(?:s|ed|ure|ures|ing)?\b|\bfatal\b|\bexception\b|traceback|"
    r"\bpanic\b|\bdenied\b|\bcannot\b|\bcould not\b|\bunable to\b|\bnot found\b|\bundefined\b|"
    r"segmentation fault|\bassert|\bexpected\b|\bunexpected\b|\bnot ok\b|[✗✘×⨯❌]|^\s*E\s{2,})")
# progress / download chatter: never treated as an error, dropped from the summary
NOISE = re.compile(
    r"(?i)^\s*(npm (verbose|http|info|timing|sill|silly)\b|yarn (info|verbose)\b|"
    r"(downloading|fetching|resolving|collecting|using cached|requirement already|unpacking|extracting|"
    r"linking|progress|preparing|building wheel|copying|compiling|transforming|rendering chunks|computing gzip)\b|"
    r"-\s+(installing|downloading|upgrading|updating|locking|removing)\b|package operations|"
    r"\d+(\.\d+)?\s*%|\[[#=>\-. ]{5,}\]|(\S+/)?\S+\.(js|mjs|css|map|woff2?|png|svg|jpe?g)\s+[\d.,]+\s*k?i?B\b)")
# lines that mention an error word but are not one
FALSE_ALARM = re.compile(
    r"(?i)(\b0 (errors?|failed|failures?|failing)\b|\bno errors\b|\bfound 0\b|failed optional dependency|"
    r"skipping optional|\bdeprecated\b|npm warn|\bwarn(ing)?\b.*\bpeer\b)")
URLISH = re.compile(r"\S*[/@\\]\S*|\S+\.(php|js|ts|py|rb|go|rs|java)\b")


def is_important(line):
    if NOISE.search(line) or FALSE_ALARM.search(line):
        return False
    # ignore error words that are only part of a path, url or package name (http-errors, es-errors)
    return bool(IMPORTANT.search(URLISH.sub(" ", line)) or re.search(r"(?i)\b(FAIL|ERROR)\b", line))


def clean(raw):
    out = []
    for line in raw.decode("utf-8", "replace").split("\n"):
        if "\r" in line:  # progress bar redraws: keep only the final state
            parts = [p for p in line.split("\r") if p.strip()]
            line = parts[-1] if parts else ""
        line = ANSI.sub("", line).rstrip()
        if line or (out and out[-1]):
            out.append(line)
    while out and not out[-1]:
        out.pop()
    return out


def summarize(lines, code, log, cmd):
    n = len(lines)
    if n <= SHORT_LINES:
        return "\n".join(lines)
    # final summary: the last TAIL lines that are not progress/download chatter
    tail_idx = [k for k in range(n) if lines[k].strip() and not NOISE.search(lines[k])][-TAIL:]
    tail_start = tail_idx[0] if tail_idx else n
    keep, extra, i = [], 0, 0
    while i < tail_start:
        if is_important(lines[i]):
            if len(keep) >= MAX_IMPORTANT:
                extra += 1
                i += 1
                continue
            keep.append((i, lines[i]))
            j = i + 1
            while j < min(tail_start, i + 1 + CONTEXT_AFTER) and lines[j].strip() and not NOISE.search(lines[j]):
                keep.append((j, lines[j]))  # a little context: stack frame, expected/actual
                j += 1
            i = j
            continue
        i += 1
    shown = len(keep) + len(tail_idx)
    out = ["[quiet-hook] exit %d - %d lines, showing %d (errors/failures + final summary). "
           "Full log: %s - rerun with CLAUDE_NOFILTER=1 for raw output." % (code, n, shown, log)]
    if keep:
        out.append("--- errors / failures ---")
        prev = None
        for k, line in keep:
            if prev is not None and k != prev + 1:
                out.append("  ...")
            out.append(line)
            prev = k
        if extra:
            out.append("  ... +%d more matching lines in the full log" % extra)
    out.append("--- final summary ---")
    prev = None
    for k in tail_idx:
        if prev is not None and k != prev + 1 and lines[k - 1].strip():
            out.append("  ...")
        out.append(lines[k])
        prev = k
    return "\n".join(out)


def run(cmd):
    logdir = os.path.join(tempfile.gettempdir(), "claude-quiet-logs")
    os.makedirs(logdir, exist_ok=True)
    now = time.time()
    for f in os.listdir(logdir):  # prune logs older than a day
        p = os.path.join(logdir, f)
        try:
            if now - os.path.getmtime(p) > 86400:
                os.remove(p)
        except OSError:
            pass
    log = os.path.join(logdir, time.strftime("%Y%m%d-%H%M%S-") + str(os.getpid()) + ".log")
    shell = os.environ.get("SHELL") or "/bin/bash"
    if not os.path.exists(shell):
        shell = "/bin/bash"
    raw = bytearray()
    proc = subprocess.Popen([shell, "-c", cmd], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                            stdin=subprocess.DEVNULL)

    def stop(signum, _frame):
        try:
            proc.terminate()
        except Exception:
            pass
    for s in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
        signal.signal(s, stop)

    with open(log, "wb") as fh:
        fh.write(("$ " + cmd + "\n").encode())
        for chunk in iter(lambda: proc.stdout.read1(65536) if hasattr(proc.stdout, "read1") else proc.stdout.read(65536), b""):
            fh.write(chunk)
            fh.flush()
            raw.extend(chunk)
    code = proc.wait()
    if code < 0:
        code = 128 - code
    text = summarize(clean(bytes(raw)), code, log, cmd)
    if text:
        sys.stdout.write(text + "\n")
    return code


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "run":
        args = sys.argv[2:]
        if args and args[0] == "--":
            args = args[1:]
        sys.exit(run(" ".join(args)))
    sys.exit(hook())
