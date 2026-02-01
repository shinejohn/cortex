import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle } from
'react';
export const WritingArea = forwardRef(
  ({ content, onChange, isPreview }, ref) => {
    const editorRef = useRef(null);
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      },
      getContent: () => {
        if (editorRef.current) {
          return editorRef.current.innerHTML;
        }
        return '';
      }
    }));
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }, [content]);
    const handleInput = () => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };
    const handlePaste = (e) => {
      // Prevent default paste behavior
      e.preventDefault();
      // Get text from clipboard
      const text = e.clipboardData.getData('text/plain');
      // Insert text at cursor position
      document.execCommand('insertText', false, text);
    };
    const handleKeyDown = (e) => {
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold', false, null);
            handleInput();
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic', false, null);
            handleInput();
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline', false, null);
            handleInput();
            break;
          default:
            break;
        }
      }
    };
    return (
      <div className="relative min-h-[calc(100vh-200px)]">
        {isPreview ?
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: content
          }} /> :


        <div
          ref={editorRef}
          className="outline-none prose prose-lg max-w-none focus:ring-0"
          contentEditable={true}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
          spellCheck={true}
          data-placeholder="Start writing your article here..."
          style={{
            minHeight: '300px'
          }} />

        }
      </div>);

  }
);
WritingArea.displayName = 'WritingArea';