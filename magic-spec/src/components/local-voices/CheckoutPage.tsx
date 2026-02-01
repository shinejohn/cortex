import React, { useEffect, useState, useRef, Component } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Bell,
  CreditCard,
  Lock,
  RocketIcon,
  ChevronRight,
  ArrowLeft,
  TrendingUpIcon,
  ShieldIcon,
  CheckCircleIcon,
  InfoIcon,
  Copy,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  AlertCircle,
  X,
  CreditCardIcon,
  Gift,
  Percent,
  DollarSign,
  CheckCircle,
  User,
  Calendar,
  HelpCircle,
  ExternalLink,
  Loader } from
'lucide-react';
export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<any>({
    name: 'Professional Broadcaster',
    monthlyPrice: 39.99,
    features: [
    'Up to 50 communities',
    '25,000 downloads/month included',
    '5 shows/podcasts',
    '50 hours storage',
    'Video podcast support (1080p)',
    'Advanced analytics']

  });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [addons, setAddons] = useState({
    seoBoost: false,
    extraStorage: '',
    extraShows: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    email: 'johndoe@example.com',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    savePaymentMethod: false,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeStatus, setPromoCodeStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'>(
    'idle');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitStatus, setFormSubmitStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'>(
    'idle');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([
  {
    id: 'card',
    name: 'Credit Card',
    icon: <CreditCardIcon className="h-5 w-5" />
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: <div className="h-5 w-5" />
  },
  {
    id: 'gift',
    name: 'Gift Card',
    icon: <Gift className="h-5 w-5" />
  }]
  );
  const [notifications, setNotifications] = useState([
  {
    id: 1,
    title: 'Special discount available',
    message: 'Use code VOICES20 for 20% off your first 3 months!',
    time: '2 hours ago',
    read: false
  },
  {
    id: 2,
    title: 'New creator features',
    message: 'Check out our new analytics dashboard for podcasters.',
    time: '1 day ago',
    read: false
  },
  {
    id: 3,
    title: 'Your trial is ending soon',
    message: 'Your free trial will end in 3 days. Upgrade now to continue.',
    time: '2 days ago',
    read: true
  }]
  );
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shareOptionsRef = useRef<HTMLDivElement>(null);
  // Get add-on prices
  const getAddonPrice = (type: string, value: string) => {
    if (type === 'extraStorage') {
      switch (value) {
        case '+10 hours':
          return 5;
        case '+50 hours':
          return 20;
        case '+100 hours':
          return 35;
        default:
          return 0;
      }
    } else if (type === 'extraShows') {
      switch (value) {
        case '+1 show':
          return 5;
        case '+3 shows':
          return 12;
        case '+5 shows':
          return 18;
        default:
          return 0;
      }
    }
    return 0;
  };
  // Calculate subtotal
  const calculateSubtotal = () => {
    let subtotal =
    billingCycle === 'monthly' ?
    selectedPlan.monthlyPrice :
    selectedPlan.monthlyPrice * 10;
    if (addons.seoBoost) {
      subtotal += billingCycle === 'monthly' ? 5 : 50;
    }
    if (addons.extraStorage) {
      subtotal +=
      billingCycle === 'monthly' ?
      getAddonPrice('extraStorage', addons.extraStorage) :
      getAddonPrice('extraStorage', addons.extraStorage) * 10;
    }
    if (addons.extraShows) {
      subtotal +=
      billingCycle === 'monthly' ?
      getAddonPrice('extraShows', addons.extraShows) :
      getAddonPrice('extraShows', addons.extraShows) * 10;
    }
    return subtotal;
  };
  // Calculate discount
  const calculateDiscount = () => {
    return promoDiscount > 0 ? calculateSubtotal() * (promoDiscount / 100) : 0;
  };
  // Calculate tax (simplified - 7% tax rate)
  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.07;
  };
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  // Handle input changes
  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
    type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setPaymentInfo({
        ...paymentInfo,
        address: {
          ...paymentInfo.address,
          [addressField]: value
        }
      });
    } else if (type === 'checkbox') {
      if (name === 'savePaymentMethod') {
        setPaymentInfo({
          ...paymentInfo,
          [name]: checked
        });
      } else if (name === 'seoBoost') {
        setAddons({
          ...addons,
          [name]: checked
        });
      }
    } else {
      // Format card number with spaces
      if (name === 'cardNumber') {
        const formattedValue = value.
        replace(/\s/g, '').
        replace(/(\d{4})/g, '$1 ').
        trim();
        setPaymentInfo({
          ...paymentInfo,
          [name]: formattedValue
        });
      }
      // Format expiry date
      else if (name === 'expiryDate') {
        let formattedValue = value.replace(/\D/g, '');
        if (formattedValue.length > 2) {
          formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
        }
        setPaymentInfo({
          ...paymentInfo,
          [name]: formattedValue
        });
      } else {
        setPaymentInfo({
          ...paymentInfo,
          [name]: value
        });
      }
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  // Handle addon selection
  const handleAddonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddons({
      ...addons,
      [name]: value
    });
  };
  // Toggle billing cycle
  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly');
  };
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Only validate fields relevant to the active payment method
    if (activePaymentMethod === 'card') {
      if (!paymentInfo.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(paymentInfo.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!paymentInfo.cardholderName) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
      if (!paymentInfo.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      if (!paymentInfo.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        newErrors.expiryDate = 'Please use MM/YY format';
      } else {
        // Check if the card is expired
        const [month, year] = paymentInfo.expiryDate.
        split('/').
        map((part) => parseInt(part, 10));
        const expiryDate = new Date(2000 + year, month - 1); // Month is 0-indexed in JS Date
        const currentDate = new Date();
        if (expiryDate < currentDate) {
          newErrors.expiryDate = 'Card has expired';
        }
      }
      if (!paymentInfo.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    }
    // Always validate address regardless of payment method
    if (!paymentInfo.address.line1) {
      newErrors['address.line1'] = 'Address is required';
    }
    if (!paymentInfo.address.city) {
      newErrors['address.city'] = 'City is required';
    }
    if (!paymentInfo.address.state) {
      newErrors['address.state'] = 'State is required';
    }
    if (!paymentInfo.address.zipCode) {
      newErrors['address.zipCode'] = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(paymentInfo.address.zipCode)) {
      newErrors['address.zipCode'] = 'Please enter a valid ZIP code';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Apply promo code
  const applyPromoCode = () => {
    if (!promoCode) return;
    setPromoCodeStatus('loading');
    // Simulate API call
    setTimeout(() => {
      if (promoCode.toUpperCase() === 'VOICES20') {
        setPromoDiscount(20);
        setPromoCodeStatus('success');
      } else {
        setPromoCodeStatus('error');
        setPromoDiscount(0);
      }
    }, 1000);
  };
  // Share checkout
  const handleShareCheckout = (platform: string) => {
    // Get the current URL
    const shareUrl = window.location.href;
    const shareText = `Check out my Local Voices subscription for ${selectedPlan.name}!`;
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent('Check out Local Voices')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        setShowShareOptions(false);
        return;
    }
    // Open share dialog in new window
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      setShowShareOptions(false);
    }
  };
  // Handle notification click
  const handleNotificationClick = (notificationId: number) => {
    // Mark notification as read
    setNotifications(
      notifications.map((notification) =>
      notification.id === notificationId ?
      {
        ...notification,
        read: true
      } :
      notification
      )
    );
    // Handle specific notification actions
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      if (notification.id === 1) {
        // Apply the promo code automatically
        setPromoCode('VOICES20');
        applyPromoCode();
      } else if (notification.id === 2) {
        // Redirect to analytics dashboard
        alert('Redirecting to analytics dashboard...');
      } else if (notification.id === 3) {

        // No specific action needed, already on upgrade page
      }}
    setShowNotifications(false);
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        element.focus();
      }
      return;
    }
    setFormSubmitted(true);
    setFormSubmitStatus('loading');
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      // Randomly succeed or fail to demonstrate both states
      const success = Math.random() > 0.2; // 80% success rate
      setIsProcessing(false);
      setFormSubmitStatus(success ? 'success' : 'error');
      if (success) {
        setShowSuccessMessage(true);
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/local-voices/dashboard', {
            state: {
              plan: selectedPlan,
              billingCycle,
              addons,
              total: calculateTotal()
            }
          });
        }, 2000);
      } else {
        setErrorMessage(
          'There was an issue processing your payment. Please check your payment details and try again.'
        );
        setShowErrorMessage(true);
      }
    }, 2000);
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node))
      {
        setShowNotifications(false);
      }
      if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target as Node))
      {
        setShowUserMenu(false);
      }
      if (
      shareOptionsRef.current &&
      !shareOptionsRef.current.contains(event.target as Node))
      {
        setShowShareOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Get unread notifications count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="font-display text-2xl font-bold text-news-primary">

                Day.News
              </Link>
            </div>
            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Home
              </Link>
              <Link
                to="/news"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                News
              </Link>
              <Link
                to="/business"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Business
              </Link>
              <Link
                to="/eventsCalendar"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Events
              </Link>
              <Link
                to="/local-voices"
                className="text-news-primary font-semibold"
                aria-current="page">

                Local Voices
              </Link>
              <Link
                to="/government"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Government
              </Link>
              <Link
                to="/sports"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Sports
              </Link>
            </nav>
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="text-gray-600 hover:text-news-primary relative p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label={`Notifications (${unreadNotificationsCount} unread)`}>

                  <Bell className="h-6 w-6" />
                  {unreadNotificationsCount > 0 &&
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  }
                </button>
                {showNotifications &&
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ?
                    notifications.map((notification) =>
                    <button
                      key={notification.id}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() =>
                      handleNotificationClick(notification.id)
                      }>

                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                          </button>
                    ) :

                    <div className="px-4 py-6 text-center text-gray-500">
                          <p>No notifications</p>
                        </div>
                    }
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button
                      className="text-news-primary hover:text-news-primary-dark text-sm font-medium w-full text-center"
                      onClick={() => {
                        setNotifications(
                          notifications.map((n) => ({
                            ...n,
                            read: true
                          }))
                        );
                        setShowNotifications(false);
                      }}>

                        Mark all as read
                      </button>
                    </div>
                  </div>
                }
              </div>
              {/* User Profile */}
              <div className="relative user-menu" ref={userMenuRef}>
                <button
                  className="flex items-center hover:opacity-80 transition-opacity"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}>

                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User profile"
                    className="h-8 w-8 rounded-full object-cover" />

                  <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                </button>
                {showUserMenu &&
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        John Doe
                      </p>
                      <p className="text-xs text-gray-500">
                        johndoe@example.com
                      </p>
                    </div>
                    <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                      Your Profile
                    </Link>
                    <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                      Settings
                    </Link>
                    <Link
                    to="/local-voices/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                      Creator Dashboard
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                        Sign out
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center">
            <div className="flex items-center w-full max-w-3xl justify-between">
              <div className="flex flex-col items-center">
                <div
                  className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center font-medium"
                  aria-label="Step 1: Choose Plan (completed)">

                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  Choose Plan
                </span>
              </div>
              <div
                className="w-full h-1 bg-green-500 mx-2"
                aria-hidden="true">
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center font-medium"
                  aria-label="Step 2: Add-ons (completed)">

                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  Add-ons
                </span>
              </div>
              <div
                className="w-full h-1 bg-news-primary mx-2"
                aria-hidden="true">
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="h-8 w-8 rounded-full bg-news-primary text-white flex items-center justify-center font-medium"
                  aria-label="Step 3: Payment (current)">

                  3
                </div>
                <span className="text-xs font-medium text-news-primary mt-1">
                  Payment
                </span>
              </div>
              <div
                className="w-full h-1 bg-gray-200 mx-2"
                aria-hidden="true">
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium"
                  aria-label="Step 4: Confirm (not completed)">

                  4
                </div>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  Confirm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Success/Error Messages */}
      {showSuccessMessage &&
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Thank you for your purchase. You're now ready to start creating
              amazing content!
            </p>
            <p className="text-gray-600 text-center text-sm mb-4">
              Redirecting to your dashboard...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-news-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      }
      {showErrorMessage &&
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Payment Failed
                </h3>
              </div>
              <button
              onClick={() => setShowErrorMessage(false)}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close">

                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
              onClick={() => setShowErrorMessage(false)}
              className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors">

                Try Again
              </button>
            </div>
          </div>
        </div>
      }
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/local-voices/pricing')}
            className="inline-flex items-center text-news-primary hover:text-news-primary-dark transition-colors"
            aria-label="Back to Plans">

            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Plans
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            Complete Your Local Voices Subscription
          </h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Order Flow (60%) */}
          <div className="lg:w-3/5">
            {/* Selected Plan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Selected Plan
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative" ref={shareOptionsRef}>
                    <button
                      onClick={() => setShowShareOptions(!showShareOptions)}
                      className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center"
                      aria-label="Share this plan"
                      aria-expanded={showShareOptions}>

                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                    {showShareOptions &&
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                        <button
                        onClick={() => handleShareCheckout('facebook')}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                          Facebook
                        </button>
                        <button
                        onClick={() => handleShareCheckout('twitter')}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                          Twitter
                        </button>
                        <button
                        onClick={() => handleShareCheckout('linkedin')}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                          LinkedIn
                        </button>
                        <button
                        onClick={() => handleShareCheckout('email')}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                          <Mail className="h-4 w-4 mr-2 text-gray-600" />
                          Email
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                        onClick={() => handleShareCheckout('copy')}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">

                          <Copy className="h-4 w-4 mr-2 text-gray-600" />
                          Copy Link
                        </button>
                      </div>
                    }
                  </div>
                  <Link
                    to="/local-voices/pricing"
                    className="text-news-primary hover:text-news-primary-dark text-sm font-medium"
                    aria-label="Change plan">

                    Change plan
                  </Link>
                </div>
              </div>
              <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900">
                    {selectedPlan.name}
                  </h3>
                  <div className="text-news-primary font-bold">
                    {formatCurrency(
                      billingCycle === 'monthly' ?
                      selectedPlan.monthlyPrice :
                      selectedPlan.monthlyPrice * 10
                    )}
                    <span className="text-gray-500 font-normal text-sm">
                      /{billingCycle}
                    </span>
                  </div>
                </div>
                <ul className="space-y-1 mt-3">
                  {selectedPlan.features.map(
                    (feature: string, index: number) =>
                    <li
                      key={index}
                      className="flex items-start text-sm text-gray-700">

                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>

                  )}
                </ul>
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      First payment due today
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        billingCycle === 'monthly' ?
                        selectedPlan.monthlyPrice :
                        selectedPlan.monthlyPrice * 10
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Next billing date:{' '}
                    {new Date(
                      Date.now() +
                      (billingCycle === 'monthly' ? 30 : 365) *
                      24 *
                      60 *
                      60 *
                      1000
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            {/* Add-ons Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Boost Your Success
              </h2>
              {/* SEO Boost Add-on */}
              <div
                className={`border rounded-lg p-4 mb-6 transition-colors ${addons.seoBoost ? 'border-news-primary bg-blue-50' : 'border-gray-200 hover:border-news-primary'}`}>

                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <input
                      type="checkbox"
                      id="seoBoost"
                      name="seoBoost"
                      checked={addons.seoBoost}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-news-primary rounded border-gray-300 focus:ring-news-primary"
                      aria-label="Add SEO Boost to your subscription" />

                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <RocketIcon className="h-5 w-5 text-news-primary mr-2" />
                        <h3 className="font-bold text-gray-900">SEO Boost™</h3>
                      </div>
                      <div className="text-news-primary font-medium">
                        ${billingCycle === 'monthly' ? '5' : '50'}/
                        {billingCycle}
                      </div>
                    </div>
                    <ul className="space-y-2 mb-3">
                      <li className="flex items-start text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          Every episode fully transcribed and searchable
                        </span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>10,000+ keywords indexed per episode</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>40% more audience from search traffic</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Voice search optimized</span>
                      </li>
                    </ul>
                    <div className="bg-green-50 text-green-800 text-sm p-2 rounded-md">
                      <strong>Save 80%:</strong> Others charge $25+ per episode,
                      we charge $
                      {billingCycle === 'monthly' ? '5/month' : '50/year'}{' '}
                      unlimited
                    </div>
                  </div>
                </div>
              </div>
              {/* Extra Storage Add-on */}
              <div className="mb-6">
                <label
                  htmlFor="extraStorage"
                  className="block font-medium text-gray-700 mb-2">

                  Need more storage?
                </label>
                <select
                  id="extraStorage"
                  name="extraStorage"
                  value={addons.extraStorage}
                  onChange={handleAddonChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary transition-colors"
                  aria-label="Select additional storage">

                  <option value="">No additional storage</option>
                  <option value="+10 hours">
                    +10 hours - ${billingCycle === 'monthly' ? '5' : '50'}/
                    {billingCycle}
                  </option>
                  <option value="+50 hours">
                    +50 hours - ${billingCycle === 'monthly' ? '20' : '200'}/
                    {billingCycle}
                  </option>
                  <option value="+100 hours">
                    +100 hours - ${billingCycle === 'monthly' ? '35' : '350'}/
                    {billingCycle}
                  </option>
                </select>
                {addons.extraStorage &&
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                    <InfoIcon className="h-4 w-4 mr-1 text-blue-500" />
                    <span>
                      {addons.extraStorage === '+10 hours' &&
                    'Good for podcasts up to 30 minutes long, 20 episodes/month'}
                      {addons.extraStorage === '+50 hours' &&
                    'Ideal for longer shows up to 1 hour, 50 episodes/month'}
                      {addons.extraStorage === '+100 hours' &&
                    'Perfect for frequent publishers with shows over 1 hour'}
                    </span>
                  </div>
                }
              </div>
              {/* Extra Shows Add-on */}
              <div>
                <label
                  htmlFor="extraShows"
                  className="block font-medium text-gray-700 mb-2">

                  Need more shows?
                </label>
                <select
                  id="extraShows"
                  name="extraShows"
                  value={addons.extraShows}
                  onChange={handleAddonChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary transition-colors"
                  aria-label="Select additional shows">

                  <option value="">No additional shows</option>
                  <option value="+1 show">
                    +1 show - ${billingCycle === 'monthly' ? '5' : '50'}/
                    {billingCycle}
                  </option>
                  <option value="+3 shows">
                    +3 shows - ${billingCycle === 'monthly' ? '12' : '120'}/
                    {billingCycle}
                  </option>
                  <option value="+5 shows">
                    +5 shows - ${billingCycle === 'monthly' ? '18' : '180'}/
                    {billingCycle}
                  </option>
                </select>
                {addons.extraShows &&
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                    <InfoIcon className="h-4 w-4 mr-1 text-blue-500" />
                    <span>
                      Each additional show gets its own RSS feed, analytics, and
                      audience.
                    </span>
                  </div>
                }
              </div>
            </div>
            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Payment Details
              </h2>
              {/* Payment Method Tabs */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    {paymentMethods.map((method) =>
                    <button
                      key={method.id}
                      onClick={() => setActivePaymentMethod(method.id)}
                      className={`py-3 px-4 text-sm font-medium border-b-2 ${activePaymentMethod === method.id ? 'border-news-primary text-news-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} transition-colors flex items-center`}
                      aria-selected={activePaymentMethod === method.id}
                      aria-controls={`${method.id}-tab-panel`}
                      id={`${method.id}-tab`}
                      role="tab">

                        {method.icon}
                        <span className="ml-2">{method.name}</span>
                      </button>
                    )}
                  </nav>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Credit Card Tab Panel */}
                <div
                  id="card-tab-panel"
                  role="tabpanel"
                  aria-labelledby="card-tab"
                  className={
                  activePaymentMethod === 'card' ? 'block' : 'hidden'
                  }>

                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={paymentInfo.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-md ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={
                        errors.email ? 'email-error' : undefined
                        } />

                      {errors.email &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="email-error">

                          {errors.email}
                        </p>
                      }
                    </div>
                    {/* Cardholder Name */}
                    <div>
                      <label
                        htmlFor="cardholderName"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="cardholderName"
                        name="cardholderName"
                        value={paymentInfo.cardholderName}
                        onChange={handleInputChange}
                        className={`w-full rounded-md ${errors.cardholderName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                        placeholder="Name as it appears on card"
                        aria-invalid={errors.cardholderName ? 'true' : 'false'}
                        aria-describedby={
                        errors.cardholderName ?
                        'cardholderName-error' :
                        undefined
                        } />

                      {errors.cardholderName &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="cardholderName-error">

                          {errors.cardholderName}
                        </p>
                      }
                    </div>
                    {/* Card Number */}
                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={handleInputChange}
                          className={`w-full rounded-md ${errors.cardNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm pl-3 pr-10 transition-colors`}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          aria-invalid={errors.cardNumber ? 'true' : 'false'}
                          aria-describedby={
                          errors.cardNumber ? 'cardNumber-error' : undefined
                          } />

                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <CreditCard
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true" />

                        </div>
                      </div>
                      {errors.cardNumber &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="cardNumber-error">

                          {errors.cardNumber}
                        </p>
                      }
                    </div>
                    {/* Expiry Date and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="expiryDate"
                          className="block text-sm font-medium text-gray-700 mb-1">

                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={handleInputChange}
                          className={`w-full rounded-md ${errors.expiryDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                          placeholder="MM/YY"
                          maxLength={5}
                          aria-invalid={errors.expiryDate ? 'true' : 'false'}
                          aria-describedby={
                          errors.expiryDate ? 'expiryDate-error' : undefined
                          } />

                        {errors.expiryDate &&
                        <p
                          className="mt-1 text-sm text-red-500"
                          id="expiryDate-error">

                            {errors.expiryDate}
                          </p>
                        }
                      </div>
                      <div>
                        <label
                          htmlFor="cvv"
                          className="block text-sm font-medium text-gray-700 mb-1">

                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={handleInputChange}
                          className={`w-full rounded-md ${errors.cvv ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                          placeholder="123"
                          maxLength={4}
                          aria-invalid={errors.cvv ? 'true' : 'false'}
                          aria-describedby={
                          errors.cvv ? 'cvv-error' : undefined
                          } />

                        {errors.cvv &&
                        <p
                          className="mt-1 text-sm text-red-500"
                          id="cvv-error">

                            {errors.cvv}
                          </p>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bank Transfer Tab Panel */}
                <div
                  id="bank-tab-panel"
                  role="tabpanel"
                  aria-labelledby="bank-tab"
                  className={
                  activePaymentMethod === 'bank' ? 'block' : 'hidden'
                  }>

                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <InfoIcon
                            className="h-5 w-5 text-blue-400"
                            aria-hidden="true" />

                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Bank Transfer Information
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Please use the following details to complete your
                              bank transfer. Your subscription will be activated
                              once we confirm receipt of your payment (1-3
                              business days).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Bank Account Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Account Name:</span>
                          <span className="text-gray-900 font-medium">
                            Day.News Media LLC
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Account Number:</span>
                          <span className="text-gray-900 font-medium">
                            XXXX-XXXX-7890
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Routing Number:</span>
                          <span className="text-gray-900 font-medium">
                            123456789
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Bank Name:</span>
                          <span className="text-gray-900 font-medium">
                            First National Bank
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reference:</span>
                          <span className="text-gray-900 font-medium">
                            LV-{Math.floor(Math.random() * 1000000)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <p>
                          Please include your reference number in the transfer
                          details to ensure your payment is properly credited to
                          your account.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Email for Payment Confirmation
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={paymentInfo.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-md ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={
                        errors.email ? 'email-error' : undefined
                        } />

                      {errors.email &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="email-error">

                          {errors.email}
                        </p>
                      }
                    </div>
                  </div>
                </div>
                {/* Gift Card Tab Panel */}
                <div
                  id="gift-tab-panel"
                  role="tabpanel"
                  aria-labelledby="gift-tab"
                  className={
                  activePaymentMethod === 'gift' ? 'block' : 'hidden'
                  }>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="giftCardCode"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Gift Card Code
                      </label>
                      <input
                        type="text"
                        id="giftCardCode"
                        name="giftCardCode"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-news-primary focus:border-news-primary transition-colors"
                        placeholder="Enter your 16-digit gift card code" />

                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={paymentInfo.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-md ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={
                        errors.email ? 'email-error' : undefined
                        } />

                      {errors.email &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="email-error">

                          {errors.email}
                        </p>
                      }
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <InfoIcon
                            className="h-5 w-5 text-yellow-400"
                            aria-hidden="true" />

                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Gift Card Information
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Gift cards can be used for any subscription plan.
                              If the gift card value is less than your selected
                              plan, you'll be asked to pay the difference.
                            </p>
                          </div>
                          <div className="mt-2">
                            <a
                              href="#"
                              className="text-sm font-medium text-yellow-800 hover:text-yellow-700 flex items-center">

                              Need help with your gift card?
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Billing Address - Shown for all payment methods */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Billing Address
                  </h3>
                  {/* Address Line 1 */}
                  <div className="mb-4">
                    <label
                      htmlFor="address.line1"
                      className="block text-sm font-medium text-gray-700 mb-1">

                      Address
                    </label>
                    <input
                      type="text"
                      id="address.line1"
                      name="address.line1"
                      value={paymentInfo.address.line1}
                      onChange={handleInputChange}
                      className={`w-full rounded-md ${errors['address.line1'] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                      placeholder="Street address"
                      aria-invalid={errors['address.line1'] ? 'true' : 'false'}
                      aria-describedby={
                      errors['address.line1'] ?
                      'address-line1-error' :
                      undefined
                      } />

                    {errors['address.line1'] &&
                    <p
                      className="mt-1 text-sm text-red-500"
                      id="address-line1-error">

                        {errors['address.line1']}
                      </p>
                    }
                  </div>
                  {/* Address Line 2 */}
                  <div className="mb-4">
                    <label
                      htmlFor="address.line2"
                      className="block text-sm font-medium text-gray-700 mb-1">

                      <span>Apartment, suite, etc.</span>
                      <span className="text-gray-500 font-normal">
                        {' '}
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      id="address.line2"
                      name="address.line2"
                      value={paymentInfo.address.line2}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary transition-colors" />

                  </div>
                  {/* City, State, ZIP */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="address.city"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        City
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={paymentInfo.address.city}
                        onChange={handleInputChange}
                        className={`w-full rounded-md ${errors['address.city'] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                        aria-invalid={errors['address.city'] ? 'true' : 'false'}
                        aria-describedby={
                        errors['address.city'] ?
                        'address-city-error' :
                        undefined
                        } />

                      {errors['address.city'] &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="address-city-error">

                          {errors['address.city']}
                        </p>
                      }
                    </div>
                    <div>
                      <label
                        htmlFor="address.state"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        State
                      </label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={paymentInfo.address.state}
                        onChange={handleInputChange}
                        className={`w-full rounded-md ${errors['address.state'] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                        aria-invalid={
                        errors['address.state'] ? 'true' : 'false'
                        }
                        aria-describedby={
                        errors['address.state'] ?
                        'address-state-error' :
                        undefined
                        } />

                      {errors['address.state'] &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="address-state-error">

                          {errors['address.state']}
                        </p>
                      }
                    </div>
                  </div>
                  {/* ZIP Code and Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="address.zipCode"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={paymentInfo.address.zipCode}
                        onChange={handleInputChange}
                        className={`w-full rounded-md ${errors['address.zipCode'] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'} shadow-sm transition-colors`}
                        aria-invalid={
                        errors['address.zipCode'] ? 'true' : 'false'
                        }
                        aria-describedby={
                        errors['address.zipCode'] ?
                        'address-zipCode-error' :
                        undefined
                        } />

                      {errors['address.zipCode'] &&
                      <p
                        className="mt-1 text-sm text-red-500"
                        id="address-zipCode-error">

                          {errors['address.zipCode']}
                        </p>
                      }
                    </div>
                    <div>
                      <label
                        htmlFor="address.country"
                        className="block text-sm font-medium text-gray-700 mb-1">

                        Country
                      </label>
                      <select
                        id="address.country"
                        name="address.country"
                        value={paymentInfo.address.country}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary transition-colors">

                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="NZ">New Zealand</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Save Payment Method - Only for credit card */}
                {activePaymentMethod === 'card' &&
                <div className="mt-4">
                    <label className="flex items-center">
                      <input
                      type="checkbox"
                      name="savePaymentMethod"
                      checked={paymentInfo.savePaymentMethod}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-news-primary rounded border-gray-300 focus:ring-news-primary transition-colors" />

                      <span className="ml-2 text-sm text-gray-700">
                        Save payment method for future use
                      </span>
                    </label>
                  </div>
                }
              </form>
            </div>
          </div>
          {/* Right Column - Order Summary (40%) */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              {/* Plan Summary */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">{selectedPlan.name}</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(
                      billingCycle === 'monthly' ?
                      selectedPlan.monthlyPrice :
                      selectedPlan.monthlyPrice * 10
                    )}
                  </span>
                </div>
                {/* Add-ons */}
                {addons.seoBoost &&
                <div className="flex justify-between mb-2">
                    <span className="text-gray-700">SEO Boost™</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(billingCycle === 'monthly' ? 5 : 50)}
                    </span>
                  </div>
                }
                {addons.extraStorage &&
                <div className="flex justify-between mb-2">
                    <span className="text-gray-700">
                      Extra Storage: {addons.extraStorage}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(
                      billingCycle === 'monthly' ?
                      getAddonPrice('extraStorage', addons.extraStorage) :
                      getAddonPrice('extraStorage', addons.extraStorage) *
                      10
                    )}
                    </span>
                  </div>
                }
                {addons.extraShows &&
                <div className="flex justify-between mb-2">
                    <span className="text-gray-700">
                      Extra Shows: {addons.extraShows}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(
                      billingCycle === 'monthly' ?
                      getAddonPrice('extraShows', addons.extraShows) :
                      getAddonPrice('extraShows', addons.extraShows) * 10
                    )}
                    </span>
                  </div>
                }
              </div>
              {/* Billing Cycle Toggle */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">
                    Billing cycle
                  </span>
                  <button
                    onClick={toggleBillingCycle}
                    className="relative inline-flex h-6 w-11 items-center rounded-full"
                    aria-pressed={billingCycle === 'annual'}
                    aria-label={`Switch to ${billingCycle === 'monthly' ? 'annual' : 'monthly'} billing`}>

                    <span className="sr-only">Toggle billing cycle</span>
                    <span
                      className={`inline-block h-6 w-11 rounded-full transition ${billingCycle === 'annual' ? 'bg-news-primary' : 'bg-gray-300'}`} />

                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'}`} />

                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <span
                    className={`${billingCycle === 'monthly' ? 'font-medium text-gray-900' : 'text-gray-500'}`}>

                    Monthly
                  </span>
                  <span
                    className={`${billingCycle === 'annual' ? 'font-medium text-gray-900' : 'text-gray-500'}`}>

                    Annual{' '}
                    <span className="text-green-600 font-medium">
                      (Save 17%)
                    </span>
                  </span>
                </div>
              </div>
              {/* Promo Code */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="promoCode"
                    className="block text-sm font-medium text-gray-700">

                    Promo code
                  </label>
                  {promoCodeStatus === 'success' &&
                  <span className="text-green-600 text-xs font-medium flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </span>
                  }
                </div>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true" />

                    </div>
                    <input
                      type="text"
                      id="promoCode"
                      name="promoCode"
                      className={`block w-full pl-10 pr-12 py-2 border ${promoCodeStatus === 'error' ? 'border-red-500' : promoCodeStatus === 'success' ? 'border-green-500' : 'border-gray-300'} rounded-l-md shadow-sm focus:outline-none focus:ring-news-primary focus:border-news-primary sm:text-sm transition-colors`}
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={
                      promoCodeStatus === 'success' ||
                      promoCodeStatus === 'loading'
                      } />

                    {promoCodeStatus === 'loading' &&
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Loader
                        className="h-4 w-4 text-gray-400 animate-spin"
                        aria-hidden="true" />

                      </div>
                    }
                  </div>
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    disabled={
                    !promoCode ||
                    promoCodeStatus === 'success' ||
                    promoCodeStatus === 'loading'
                    }
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm ${!promoCode || promoCodeStatus === 'success' || promoCodeStatus === 'loading' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-news-primary text-white hover:bg-news-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary'} transition-colors`}>

                    Apply
                  </button>
                </div>
                {promoCodeStatus === 'error' &&
                <p className="mt-1 text-sm text-red-500">
                    Invalid promo code. Please try again.
                  </p>
                }
                {promoCodeStatus === 'success' &&
                <p className="mt-1 text-sm text-green-600">
                    Promo code applied: {promoDiscount}% off
                  </p>
                }
              </div>
              {/* Subtotal, Discount, Tax, Total */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                {promoDiscount > 0 &&
                <div className="flex justify-between text-green-600">
                    <span>Discount ({promoDiscount}%)</span>
                    <span>-{formatCurrency(calculateDiscount())}</span>
                  </div>
                }
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax (7%)</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(calculateTax())}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900 font-bold">Total</span>
                  <span className="text-news-primary font-bold text-xl">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
                <div className="text-gray-500 text-sm text-right">
                  {billingCycle === 'monthly' ?
                  'Billed monthly' :
                  'Billed annually'}
                </div>
              </div>
              {/* Complete Purchase Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-md font-medium text-white ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-news-primary hover:bg-news-primary-dark'} transition-colors flex items-center justify-center`}
                aria-label={
                isProcessing ? 'Processing payment...' : 'Complete purchase'
                }>

                {isProcessing ?
                <>
                    <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true">

                      <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4">
                    </circle>
                      <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                    </svg>
                    Processing...
                  </> :

                'Complete Purchase'
                }
              </button>
              {/* Security Notice */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Lock className="h-4 w-4 mr-1" aria-hidden="true" />
                <span>Secure checkout powered by Stripe</span>
              </div>
              {/* Terms */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                By completing your purchase, you agree to our{' '}
                <a href="#" className="text-news-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-news-primary hover:underline">
                  Refund Policy
                </a>
                .
              </div>
              {/* Customer Support */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center">
                  <HelpCircle
                    className="h-5 w-5 text-gray-400 mr-2"
                    aria-hidden="true" />

                  <span className="text-sm text-gray-600">
                    Need help?{' '}
                    <a href="#" className="text-news-primary hover:underline">
                      Contact support
                    </a>
                  </span>
                </div>
              </div>
              {/* Social Proof */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <Star
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      aria-hidden="true" />

                    <Star
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      aria-hidden="true" />

                    <Star
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      aria-hidden="true" />

                    <Star
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      aria-hidden="true" />

                    <Star
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      aria-hidden="true" />

                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    "Day.News Local Voices helped me grow my podcast audience by
                    300% in just 3 months!"
                  </p>
                  <div className="flex items-center mt-2">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32&q=80"
                      alt="Sarah Johnson"
                      className="h-6 w-6 rounded-full mr-2" />

                    <span className="text-xs font-medium text-gray-900">
                      Sarah Johnson, The Clearwater Report
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};