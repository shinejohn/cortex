# Platform/App Fix Implementation Plan

**Generated:** 2025-12-27  
**Focus:** Fixing actual platform/app issues, not just tests  
**Total Issues:** 12 categories affecting 310 tests

---

## Executive Summary

This plan addresses root causes in the application codebase to fix platform functionality issues. Each category includes specific implementation steps, code changes required, and verification methods.

---

## Phase 1: Infrastructure & Configuration (Quick Wins)

### Category 2: Stripe Configuration
**Issue:** Stripe services fail because API keys aren't configured  
**Impact:** Payment processing, billing, ticket sales broken  
**Priority:** CRITICAL - Blocks revenue features

#### Implementation Steps:

1. **Create Stripe Configuration Helper**
   ```php
   // app/Helpers/StripeConfigHelper.php
   namespace App\Helpers;
   
   class StripeConfigHelper {
       public static function getConfig(): array {
           $key = config('services.stripe.key');
           $secret = config('services.stripe.secret');
           
           if (empty($key) || empty($secret)) {
               throw new \RuntimeException(
                   'Stripe API keys not configured. Please set STRIPE_KEY and STRIPE_SECRET in .env'
               );
           }
           
           return [
               'api_key' => $secret,
               'stripe_version' => config('services.stripe.version', '2024-11-20.acacia'),
           ];
       }
   }
   ```

2. **Update StripeConnectService**
   ```php
   // app/Services/StripeConnectService.php
   use App\Helpers\StripeConfigHelper;
   
   public function __construct() {
       $secret = config('services.stripe.secret');
       
       if (empty($secret)) {
           throw new \RuntimeException(
               'Stripe API secret not configured. Please set STRIPE_SECRET in .env'
           );
       }
       
       \Stripe\Stripe::setApiKey($secret);
       $this->stripe = new \Stripe\StripeClient($secret);
   }
   ```

3. **Update config/services.php**
   ```php
   'stripe' => [
       'key' => env('STRIPE_KEY'),
       'secret' => env('STRIPE_SECRET'),
       'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
       'version' => env('STRIPE_API_VERSION', '2024-11-20.acacia'),
   ],
   ```

4. **Add to .env.example**
   ```env
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_API_VERSION=2024-11-20.acacia
   ```

**Verification:**
- Stripe services instantiate without errors
- Payment flows work in tests
- Billing features functional

**Estimated Time:** 2 hours

---

### Category 4: Missing Service Configuration
**Issue:** Services require environment variables that aren't documented or configured  
**Impact:** Notifications, SMS, Web Push, Emergency broadcasts broken  
**Priority:** HIGH - Blocks communication features

#### Implementation Steps:

1. **Create Service Configuration Manager**
   ```php
   // app/Helpers/ServiceConfigManager.php
   namespace App\Helpers;
   
   class ServiceConfigManager {
       public static function getVapidKeys(): array {
           $publicKey = config('services.webpush.vapid_public_key');
           $privateKey = config('services.webpush.vapid_private_key');
           
           if (empty($publicKey) || empty($privateKey)) {
               throw new \RuntimeException(
                   'Web Push VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env'
               );
           }
           
           return [
               'public_key' => $publicKey,
               'private_key' => $privateKey,
           ];
       }
       
       public static function getSmsConfig(): array {
           return [
               'provider' => config('services.sms.provider', 'twilio'),
               'api_key' => config('services.sms.api_key'),
               'api_secret' => config('services.sms.api_secret'),
               'from_number' => config('services.sms.from_number'),
           ];
       }
       
       public static function getNotificationConfig(): array {
           return [
               'sns' => [
                   'region' => config('services.aws.region'),
                   'key' => config('services.aws.key'),
                   'secret' => config('services.aws.secret'),
               ],
           ];
       }
   }
   ```

2. **Update config/services.php**
   ```php
   'webpush' => [
       'vapid_public_key' => env('VAPID_PUBLIC_KEY'),
       'vapid_private_key' => env('VAPID_PRIVATE_KEY'),
   ],
   
   'sms' => [
       'provider' => env('SMS_PROVIDER', 'twilio'),
       'api_key' => env('SMS_API_KEY'),
       'api_secret' => env('SMS_API_SECRET'),
       'from_number' => env('SMS_FROM_NUMBER'),
   ],
   
   'aws' => [
       'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
       'key' => env('AWS_ACCESS_KEY_ID'),
       'secret' => env('AWS_SECRET_ACCESS_KEY'),
   ],
   
   'emergency' => [
       'api_key' => env('EMERGENCY_BROADCAST_API_KEY'),
       'api_url' => env('EMERGENCY_BROADCAST_API_URL'),
   ],
   ```

3. **Update Services to Use Config Manager**
   ```php
   // app/Services/WebPushService.php
   use App\Helpers\ServiceConfigManager;
   
   public function __construct() {
       $vapidKeys = ServiceConfigManager::getVapidKeys();
       // Initialize with keys
   }
   ```

4. **Add to .env.example**
   ```env
   # Web Push
   VAPID_PUBLIC_KEY=
   VAPID_PRIVATE_KEY=
   
   # SMS
   SMS_PROVIDER=twilio
   SMS_API_KEY=
   SMS_API_SECRET=
   SMS_FROM_NUMBER=
   
   # AWS (for SNS)
   AWS_DEFAULT_REGION=us-east-1
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   
   # Emergency Broadcast
   EMERGENCY_BROADCAST_API_KEY=
   EMERGENCY_BROADCAST_API_URL=
   ```

**Verification:**
- All services instantiate without errors
- Configuration errors are clear and actionable
- Services fail gracefully with helpful messages

**Estimated Time:** 3 hours

---

## Phase 2: Service Architecture (Critical)

### Category 1: Service Binding Resolution
**Issue:** 47 service classes can't be resolved by Laravel container  
**Impact:** Core functionality broken - services don't work  
**Priority:** CRITICAL - Blocks major features

#### Root Cause Analysis:
Services exist but aren't properly registered or have dependency injection issues.

#### Implementation Steps:

1. **Audit All Services**
   ```bash
   # Create script to check service existence
   php artisan tinker --execute="
   \$services = [
       'App\Services\AlphaSite\CommunityService',
       'App\Services\AlphaSite\LinkingService',
       // ... list all services
   ];
   foreach (\$services as \$service) {
       echo class_exists(\$service) ? '✓' : '✗';
       echo ' ' . \$service . PHP_EOL;
   }
   "
   ```

2. **Create Service Provider for Unregistered Services**
   ```php
   // app/Providers/ServiceProvider.php (or update AppServiceProvider)
   namespace App\Providers;
   
   use Illuminate\Support\ServiceProvider;
   use App\Services\AlphaSite\CommunityService;
   use App\Services\AlphaSite\LinkingService;
   // ... import all services
   
   class ServiceProvider extends ServiceProvider {
       public function register(): void {
           // Bind services as singletons
           $this->app->singleton(CommunityService::class, function ($app) {
               return new CommunityService(
                   $app->make(Dependency1::class),
                   $app->make(Dependency2::class)
               );
           });
           
           // Or use auto-wiring with interface bindings
           $this->app->bind(
               \App\Contracts\CommunityServiceInterface::class,
               CommunityService::class
           );
       }
   }
   ```

3. **Register All Services in AppServiceProvider**
   ```php
   // app/Providers/AppServiceProvider.php
   public function register(): void {
       // Existing bindings
       $this->app->bind(GeocodingServiceInterface::class, GeocodingService::class);
       
       // Register AlphaSite services
       $this->app->singleton(\App\Services\AlphaSite\CommunityService::class);
       $this->app->singleton(\App\Services\AlphaSite\LinkingService::class);
       $this->app->singleton(\App\Services\AlphaSite\PageGeneratorService::class);
       $this->app->singleton(\App\Services\AlphaSite\SMBCrmService::class);
       $this->app->singleton(\App\Services\AlphaSite\SubscriptionLifecycleService::class);
       $this->app->singleton(\App\Services\AlphaSite\TemplateService::class);
       
       // Register DayNews services
       $this->app->singleton(\App\Services\DayNews\AnnouncementService::class);
       $this->app->singleton(\App\Services\DayNews\ArchiveService::class);
       $this->app->singleton(\App\Services\DayNews\AuthorService::class);
       $this->app->singleton(\App\Services\DayNews\ClassifiedService::class);
       $this->app->singleton(\App\Services\DayNews\PhotoService::class);
       $this->app->singleton(\App\Services\DayNews\PodcastService::class);
       $this->app->singleton(\App\Services\DayNews\SearchService::class);
       $this->app->singleton(\App\Services\DayNews\TagService::class);
       $this->app->singleton(\App\Services\DayNews\TrendingService::class);
       
       // Register News workflow services
       $this->app->singleton(\App\Services\News\ArticleGenerationService::class);
       $this->app->singleton(\App\Services\News\BusinessDiscoveryService::class);
       $this->app->singleton(\App\Services\News\ContentCurationService::class);
       $this->app->singleton(\App\Services\News\ContentShortlistingService::class);
       $this->app->singleton(\App\Services\News\EventExtractionService::class);
       $this->app->singleton(\App\Services\News\EventPublishingService::class);
       $this->app->singleton(\App\Services\News\FactCheckingService::class);
       $this->app->singleton(\App\Services\News\FetchFrequencyService::class);
       $this->app->singleton(\App\Services\News\ImageStorageService::class);
       $this->app->singleton(\App\Services\News\NewsCollectionService::class);
       $this->app->singleton(\App\Services\News\NewsWorkflowService::class);
       $this->app->singleton(\App\Services\News\PerformerMatchingService::class);
       $this->app->singleton(\App\Services\News\PrismAiService::class);
       $this->app->singleton(\App\Services\News\PublishingService::class);
       $this->app->singleton(\App\Services\News\ScrapingBeeService::class);
       $this->app->singleton(\App\Services\News\SerpApiService::class);
       $this->app->singleton(\App\Services\News\UnsplashService::class);
       $this->app->singleton(\App\Services\News\VenueMatchingService::class);
       $this->app->singleton(\App\Services\News\WorkflowSettingsService::class);
   }
   ```

4. **Fix Service Dependencies**
   For each failing service:
   - Check constructor dependencies
   - Ensure all dependencies are resolvable
   - Add interface bindings if needed
   - Use dependency injection properly

4. **Create Service Interfaces (Best Practice)**
   ```php
   // app/Contracts/CommunityServiceInterface.php
   namespace App\Contracts;
   
   interface CommunityServiceInterface {
       public function createCommunity(array $data): Community;
   }
   
   // app/Services/AlphaSite/CommunityService.php
   namespace App\Services\AlphaSite;
   
   use App\Contracts\CommunityServiceInterface;
   
   class CommunityService implements CommunityServiceInterface {
       // Implementation
   }
   
   // In ServiceProvider
   $this->app->bind(
       CommunityServiceInterface::class,
       CommunityService::class
   );
   ```

5. **Fix Namespace Issues**
   - Verify all service namespaces match file locations
   - Ensure PSR-4 autoloading works
   - Run `composer dump-autoload`

**Verification:**
```php
// Test each service can be resolved
php artisan tinker --execute="
\$services = [/* list */];
foreach (\$services as \$service) {
    try {
        \$instance = app(\$service);
        echo '✓ ' . \$service . PHP_EOL;
    } catch (\Throwable \$e) {
        echo '✗ ' . \$service . ': ' . \$e->getMessage() . PHP_EOL;
    }
}
"
```

**Estimated Time:** 8-12 hours

---

### Category 7: Missing Controllers
**Issue:** Controllers referenced in routes don't exist or have wrong namespace  
**Impact:** Routes return 500 errors, pages don't load  
**Priority:** CRITICAL - Blocks user-facing features

#### Root Cause:
- CalendarController exists but may have namespace issues
- Some controllers may be in wrong namespace or missing

#### Implementation Steps:

1. **Audit Route-Controller Mappings**
   ```bash
   # Find all route controller references
   grep -r "::class" routes/ | grep -o "App\\Http\\Controllers\\[^']*" | sort -u
   ```

2. **Verify CalendarController Exists**
   - CalendarController exists at `app/Http/Controllers/CalendarController.php`
   - Verify namespace matches route expectations
   - Check if controller methods match route definitions

3. **Fix Namespace Issues**
   ```php
   // Ensure all controllers have correct namespace
   namespace App\Http\Controllers;
   ```

4. **Create Any Missing Controllers**
   ```php
   // app/Http/Controllers/CalendarController.php (if missing)
   namespace App\Http\Controllers;
   
   use Illuminate\Http\Request;
   use Inertia\Inertia;
   
   class CalendarController extends Controller {
       public function index(Request $request) {
           return Inertia::render('event-city/calendar/index', [
               'calendars' => [],
               // ... data
           ]);
       }
   }
   ```

3. **Fix Namespace Issues**
   - Ensure controllers are in correct namespace
   - Update route definitions if namespace changed
   - Verify controller extends base Controller

4. **Update Routes if Needed**
   ```php
   // routes/web.php
   use App\Http\Controllers\CalendarController;
   
   Route::get('/calendars', [CalendarController::class, 'index'])
       ->name('calendars.index');
   ```

**Verification:**
- All routes resolve to existing controllers
- No ReflectionException errors
- Pages load successfully

**Estimated Time:** 2-3 hours

---

## Phase 3: Database & Models (High Priority)

### Category 3: Database Schema Issues
**Issue:** Migrations don't match model expectations  
**Impact:** Data can't be saved, relationships broken  
**Priority:** HIGH - Blocks data persistence

#### Implementation Steps:

1. **Create Migration Audit Script**
   ```php
   // Create artisan command: php artisan audit:migrations
   namespace App\Console\Commands;
   
   use Illuminate\Console\Command;
   use Illuminate\Support\Facades\Schema;
   use Illuminate\Support\Facades\DB;
   
   class AuditMigrations extends Command {
       protected $signature = 'audit:migrations';
       
       public function handle() {
           $models = [
               \App\Models\Event::class,
               \App\Models\Business::class,
               // ... all models
           ];
           
           foreach ($models as $model) {
               $instance = new $model();
               $table = $instance->getTable();
               $columns = Schema::getColumnListing($table);
               $fillable = $instance->getFillable();
               
               $missing = array_diff($fillable, $columns);
               if (!empty($missing)) {
                   $this->error("{$table} missing columns: " . implode(', ', $missing));
               }
           }
       }
   }
   ```

2. **Fix Missing Columns**
   
   **Example: Events table missing `slug` column**
   ```php
   // database/migrations/YYYY_MM_DD_add_slug_to_events_table.php
   Schema::table('events', function (Blueprint $table) {
       $table->string('slug')->nullable()->unique()->after('title');
   });
   ```
   
   **Audit Process:**
   ```bash
   # For each failing model, check:
   # 1. Model fillable attributes
   # 2. Migration columns
   # 3. Factory fields
   # 4. Add missing columns via migration
   ```

3. **Fix Data Type Mismatches**
   ```php
   // Update migrations to match model casts
   Schema::table('table', function (Blueprint $table) {
       $table->json('metadata')->change(); // If model casts to array
   });
   ```

4. **Fix Constraint Violations**
   ```php
   // Update CHECK constraints or enum values
   Schema::table('table', function (Blueprint $table) {
       $table->dropColumn('old_column');
       $table->enum('status', ['new', 'valid', 'values'])->change();
   });
   ```

5. **Update Factories to Match Schema**
   ```php
   // Ensure factories don't try to set non-existent columns
   // Match factory data to actual schema
   ```

**Verification:**
- Run migration audit
- All models can be created via factories
- No QueryException errors
- Relationships work correctly

**Estimated Time:** 6-8 hours

---

### Category 9: Model ID Type Mismatches
**Issue:** Models use different ID types (UUID vs integer) inconsistently  
**Impact:** Type errors, test failures, potential data issues  
**Priority:** MEDIUM - Code quality and consistency

#### Implementation Steps:

1. **Standardize ID Strategy**
   - Decide: UUIDs for all models OR integers for all models
   - Document decision in coding standards

2. **Create Migration to Convert IDs**
   ```php
   // If converting to UUIDs
   Schema::table('table', function (Blueprint $table) {
       $table->uuid('id')->change();
   });
   
   // If converting to integers
   Schema::table('table', function (Blueprint $table) {
       $table->unsignedBigInteger('id')->change();
   });
   ```

3. **Update Models**
   ```php
   // Ensure HasUuid trait or remove it consistently
   // Update primary key type in models
   ```

4. **Update Factories**
   ```php
   // Match factory ID generation to model type
   'id' => Str::uuid(), // For UUID models
   // OR remove ID from factory for auto-increment
   ```

**Verification:**
- All models use consistent ID type
- No type mismatch errors
- Tests pass with correct expectations

**Estimated Time:** 3-4 hours

---

## Phase 4: Code Quality & Architecture

### Category 5: Mockery Final Class Issues
**Issue:** 79 services marked `final` can't be mocked in tests  
**Impact:** Testing becomes difficult, code inflexible  
**Priority:** MEDIUM - Affects testability

#### Root Cause:
- 79 out of 82 services are marked `final`
- Mockery cannot mock final classes fully
- Tests need to mock these services but can't

#### Implementation Steps:

1. **Decision: Keep `final` but Use Interfaces**
   - Keep `final` for service classes (prevents extension, maintains encapsulation)
   - Create interfaces for services that need mocking
   - Bind interfaces in service provider
   - Tests mock interfaces instead of concrete classes

2. **Create Service Interfaces**
   ```php
   // app/Contracts/StripeConnectServiceInterface.php
   namespace App\Contracts;
   
   use App\Models\Workspace;
   
   interface StripeConnectServiceInterface {
       public function createDashboardLink(Workspace $workspace): string;
       public function createConnectAccount(Workspace $workspace): \Stripe\Account;
   }
   
   // app/Services/StripeConnectService.php
   namespace App\Services;
   
   use App\Contracts\StripeConnectServiceInterface;
   
   final class StripeConnectService implements StripeConnectServiceInterface {
       // Implementation stays the same
   }
   
   // app/Providers/AppServiceProvider.php
   $this->app->bind(
       \App\Contracts\StripeConnectServiceInterface::class,
       \App\Services\StripeConnectService::class
   );
   ```

3. **Update Controllers to Use Interfaces**
   ```php
   // Controllers inject interface, not concrete class
   public function __construct(
       private StripeConnectServiceInterface $stripeService
   ) {}
   ```

4. **Alternative: Remove `final` for Testability**
   If interfaces are too much work:
   ```bash
   # Remove final from services that need mocking
   find app/Services -name "*.php" -exec sed -i '' 's/^final class/class/g' {} \;
   ```

3. **OR Use Interfaces (Better Approach)**
   ```php
   // Create interface
   interface StripeConnectServiceInterface {
       public function createDashboardLink(Workspace $workspace): string;
   }
   
   // Implement interface
   class StripeConnectService implements StripeConnectServiceInterface {
       // Implementation
   }
   
   // Bind in service provider
   $this->app->bind(
       StripeConnectServiceInterface::class,
       StripeConnectService::class
   );
   
   // Now can mock interface in tests
   ```

4. **OR Use Partial Mocks (If final is required)**
   ```php
   // In tests
   $mock = Mockery::mock(StripeConnectService::class)->makePartial();
   ```

**Decision Matrix:**
- If class needs to be extensible → Remove `final`
- If class should be sealed → Use interface + keep `final`
- If testing only issue → Use partial mocks

**Verification:**
- Services can be mocked in tests
- No "final class" errors
- Code remains maintainable

**Estimated Time:** 2-3 hours

---

### Category 8: Type Errors
**Issue:** Type mismatches cause runtime errors  
**Impact:** Features break at runtime  
**Priority:** HIGH - Causes crashes

#### Implementation Steps:

1. **Enable Strict Types**
   ```php
   // Ensure all files have
   declare(strict_types=1);
   ```

2. **Fix Method Signatures**
   ```php
   // Before
   public function process($data) {
   
   // After
   public function process(array $data): Result {
   ```

3. **Add Type Hints**
   ```php
   // Add return types
   public function getWeather(): WeatherData {
       // Implementation
   }
   
   // Add parameter types
   public function updateEvent(Event $event, array $data): Event {
       // Implementation
   }
   ```

4. **Fix Type Casting**
   ```php
   // Ensure data types match expectations
   $value = (int) $stringValue;
   $array = (array) $object;
   ```

**Verification:**
- No TypeError exceptions
- PHPStan/Psalm passes
- All type hints correct

**Estimated Time:** 3-4 hours

---

### Category 11: Argument Count Errors
**Issue:** Methods called with wrong number of arguments  
**Impact:** Fatal errors, features broken  
**Priority:** HIGH - Causes crashes

#### Implementation Steps:

1. **Find All Argument Errors**
   ```bash
   # Run tests to identify
   php artisan test 2>&1 | grep "ArgumentCountError"
   ```

2. **Fix Method Calls**
   ```php
   // Before
   $service->process($data);
   
   // After (if method requires 2 args)
   $service->process($data, $options);
   ```

3. **Add Default Parameters (If Appropriate)**
   ```php
   // Method definition
   public function process(array $data, array $options = []): Result {
       // Implementation
   }
   ```

**Verification:**
- No ArgumentCountError exceptions
- All method calls match signatures

**Estimated Time:** 1-2 hours

---

## Phase 5: Frontend & UI

### Category 6: Inertia Component Paths
**Issue:** Component paths inconsistent - some have platform prefix, some don't  
**Impact:** Pages don't render, inconsistent behavior  
**Priority:** MEDIUM - Affects UX but has workaround

#### Implementation Steps:

1. **Standardize Component Path Strategy**
   - Decision: All components use platform prefix OR none do
   - Document standard in coding guidelines

2. **Create Component Path Helper**
   ```php
   // app/Helpers/InertiaHelper.php
   namespace App\Helpers;
   
   class InertiaHelper {
       public static function componentPath(string $component): string {
           $platform = config('app.current_domain', 'event-city');
           
           // If component already has platform prefix, return as-is
           if (str_contains($component, '/')) {
               $parts = explode('/', $component, 2);
               if (in_array($parts[0], ['event-city', 'day-news', 'downtown-guide', 'alphasite', 'local-voices'])) {
                   return $component;
               }
           }
           
           return "{$platform}/{$component}";
       }
   }
   ```

3. **Update All Controllers**
   ```php
   // Before
   return Inertia::render('calendar/index', [...]);
   
   // After
   return Inertia::render(InertiaHelper::componentPath('calendar/index'), [...]);
   ```

4. **OR: Update All Components to Use Prefix**
   - Move all components to platform-specific directories
   - Update all Inertia::render() calls

**Verification:**
- All pages render correctly
- Component paths consistent
- No "component not found" errors

**Estimated Time:** 4-6 hours

---

## Phase 6: Testing Infrastructure

### Category 10: Mockery Expectation Failures
**Issue:** Mock expectations don't match actual method calls  
**Impact:** Tests fail, but actual code may work  
**Priority:** LOW - Test issue, not app issue

#### Implementation Steps:

1. **Review Mock Setups**
   ```php
   // Ensure mocks match actual usage
   $mock->shouldReceive('method')
       ->once() // Match actual call count
       ->with($expectedArgs) // Match actual arguments
       ->andReturn($value);
   ```

2. **Use Spies Instead of Mocks (If Appropriate)**
   ```php
   // Spy records calls, doesn't enforce expectations upfront
   $spy = Mockery::spy(Service::class);
   // ... run code
   $spy->shouldHaveReceived('method')->once();
   ```

**Note:** This is primarily a test issue, not an app issue. Fix tests to match actual behavior.

**Estimated Time:** 3-4 hours

---

### Category 12: Other Specific Issues
**Issue:** Various specific problems  
**Impact:** Varies  
**Priority:** Varies

#### Implementation Steps:

1. **Address Each Issue Individually**
   - Review error messages
   - Fix root cause
   - Verify fix

2. **Common Patterns:**
   - Math/Number formatting → Fix decimal handling
   - Bad method calls → Fix method names or add methods
   - Invalid expectations → Fix test assertions
   - Auth issues → Review auth configuration

**Estimated Time:** 4-6 hours

---

## Implementation Timeline

### Week 1: Critical Infrastructure
- **Day 1-2:** Stripe & Service Configuration (Phase 1)
- **Day 3-5:** Service Binding Resolution (Phase 2, Category 1)
- **Day 6-7:** Missing Controllers (Phase 2, Category 7)

### Week 2: Data & Models
- **Day 1-3:** Database Schema Fixes (Phase 3, Category 3)
- **Day 4-5:** Model ID Standardization (Phase 3, Category 9)

### Week 3: Code Quality
- **Day 1-2:** Final Class Issues (Phase 4, Category 5)
- **Day 3-4:** Type Errors (Phase 4, Category 8)
- **Day 5:** Argument Count Errors (Phase 4, Category 11)

### Week 4: Frontend & Polish
- **Day 1-3:** Inertia Component Paths (Phase 5, Category 6)
- **Day 4-5:** Other Issues & Testing (Phase 6)

**Total Estimated Time:** 20-30 hours of focused development

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Stripe services work without errors
- ✅ All service configurations documented
- ✅ Services fail gracefully with helpful errors

### Phase 2 Complete When:
- ✅ All services can be resolved by container
- ✅ All routes resolve to existing controllers
- ✅ No BindingResolutionException errors

### Phase 3 Complete When:
- ✅ All migrations match model expectations
- ✅ Models can be created without errors
- ✅ Relationships work correctly
- ✅ ID types are consistent

### Phase 4 Complete When:
- ✅ Services can be mocked in tests
- ✅ No type errors in production
- ✅ All method calls have correct arguments

### Phase 5 Complete When:
- ✅ All Inertia components render correctly
- ✅ Component paths are consistent
- ✅ No component not found errors

### Overall Success:
- ✅ All 310 tests pass
- ✅ No runtime errors in production
- ✅ All features functional
- ✅ Code quality improved

---

## Risk Mitigation

1. **Database Changes:** Always backup before migrations
2. **Service Changes:** Test in staging first
3. **Breaking Changes:** Version APIs, maintain backward compatibility
4. **Configuration:** Document all required env vars
5. **Testing:** Run full test suite after each phase

---

**Plan Generated:** 2025-12-27  
**Status:** Ready for Implementation  
**Next Step:** Begin Phase 1 - Infrastructure & Configuration

