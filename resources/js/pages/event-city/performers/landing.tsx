import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Music, MapPin, CheckCircle, Heart, Calendar } from 'lucide-react';

interface Performer {
    id: string;
    name: string;
    bio: string;
    profile_image: string;
    genres: string[];
    home_city: string;
    is_verified: boolean;
    total_tip_count: number;
    landing_page_slug: string;
    workspace_id: string;
}

interface UpcomingEvent {
    id: string;
    title: string;
    event_date: string;
    time: string;
}

interface Props {
    performer: Performer;
    upcomingEvents: UpcomingEvent[];
    stripePublicKey: string;
}

const TIP_AMOUNTS = [
    { label: '$5', cents: 500 },
    { label: '$10', cents: 1000 },
    { label: '$25', cents: 2500 },
    { label: '$50', cents: 5000 },
];

function TipPaymentForm({ performer }: { performer: Performer }) {
    const stripe = useStripe();
    const elements = useElements();
    const [selectedAmount, setSelectedAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [fanName, setFanName] = useState('');
    const [fanEmail, setFanEmail] = useState('');
    const [fanMessage, setFanMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const amountCents = isCustom ? Math.round(parseFloat(customAmount || '0') * 100) : selectedAmount;

    const getCsrfToken = (): string => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        if (amountCents < 100) {
            setError('Minimum tip amount is $1.00');
            return;
        }

        if (!fanName || !fanEmail) {
            setError('Please enter your name and email.');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const intentRes = await fetch('/api/tips/payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    performer_id: performer.id,
                    amount_cents: amountCents,
                }),
            });

            const intentData = await intentRes.json();

            if (!intentRes.ok) {
                throw new Error(intentData.error || 'Failed to create payment');
            }

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error('Card element not found');

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                intentData.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: { name: fanName, email: fanEmail },
                    },
                },
            );

            if (stripeError) {
                throw new Error(stripeError.message || 'Payment failed');
            }

            if (paymentIntent?.status === 'succeeded') {
                await fetch('/api/tips', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify({
                        performer_id: performer.id,
                        amount_cents: amountCents,
                        fan_name: fanName,
                        fan_email: fanEmail,
                        fan_message: fanMessage,
                        is_anonymous: isAnonymous,
                        payment_intent_id: paymentIntent.id,
                    }),
                });

                setSucceeded(true);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
        } finally {
            setProcessing(false);
        }
    };

    if (succeeded) {
        return (
            <div className="rounded-2xl bg-green-50 p-8 text-center dark:bg-green-900/20">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">Thank you!</h3>
                <p className="mt-2 text-green-600 dark:text-green-300">
                    Your ${(amountCents / 100).toFixed(2)} tip to {performer.name} has been sent.
                </p>
                <button
                    onClick={() => {
                        setSucceeded(false);
                        setFanMessage('');
                    }}
                    className="mt-6 rounded-lg bg-green-600 px-6 py-2 text-white transition hover:bg-green-700"
                >
                    Send Another Tip
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Selection */}
            <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Select Amount
                </label>
                <div className="grid grid-cols-4 gap-3">
                    {TIP_AMOUNTS.map((amt) => (
                        <button
                            key={amt.cents}
                            type="button"
                            onClick={() => {
                                setSelectedAmount(amt.cents);
                                setIsCustom(false);
                            }}
                            className={`rounded-xl py-3 text-lg font-bold transition ${
                                !isCustom && selectedAmount === amt.cents
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {amt.label}
                        </button>
                    ))}
                </div>
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={() => setIsCustom(true)}
                        className={`w-full rounded-xl py-3 text-sm font-medium transition ${
                            isCustom
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                        Custom Amount
                    </button>
                    {isCustom && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                max="1000"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-2xl font-bold focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Fan Info */}
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Your Name"
                    value={fanName}
                    onChange={(e) => setFanName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <input
                    type="email"
                    placeholder="Your Email"
                    value={fanEmail}
                    onChange={(e) => setFanEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <textarea
                    placeholder="Leave a message (optional)"
                    value={fanMessage}
                    onChange={(e) => setFanMessage(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Tip anonymously
                </label>
            </div>

            {/* Stripe Card Element */}
            <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Card Details
                </label>
                <div className="rounded-xl border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#374151',
                                    '::placeholder': { color: '#9CA3AF' },
                                },
                                invalid: { color: '#EF4444' },
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={processing || !stripe || amountCents < 100}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-lg font-bold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {processing ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Processing...
                    </span>
                ) : (
                    `Send $${(amountCents / 100).toFixed(2)} Tip`
                )}
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                Payments are securely processed by Stripe. 0% platform fee -- 100% goes to the performer.
            </p>
        </form>
    );
}

export default function PerformerLanding({ performer, upcomingEvents, stripePublicKey }: Props) {
    const [stripePromise] = useState(() => loadStripe(stripePublicKey));

    useEffect(() => {
        fetch(`/p/${performer.landing_page_slug}/scan`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN':
                    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        }).catch(() => {});
    }, [performer.landing_page_slug]);

    return (
        <>
            <Head title={`${performer.name} - Tip Jar`} />
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
                {/* Hero */}
                <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 pb-32 pt-16">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative mx-auto max-w-2xl px-6 text-center text-white">
                        <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-white/30 shadow-2xl">
                            <img
                                src={performer.profile_image || '/images/default-performer.jpg'}
                                alt={performer.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <h1 className="text-4xl font-bold">
                            {performer.name}
                            {performer.is_verified && (
                                <CheckCircle className="ml-2 inline h-6 w-6 text-blue-300" />
                            )}
                        </h1>
                        <div className="mt-3 flex items-center justify-center gap-4 text-purple-100">
                            {performer.home_city && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> {performer.home_city}
                                </span>
                            )}
                            {performer.genres?.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Music className="h-4 w-4" /> {performer.genres.slice(0, 2).join(', ')}
                                </span>
                            )}
                        </div>
                        {performer.total_tip_count > 0 && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm">
                                <Heart className="h-4 w-4" /> {performer.total_tip_count} tips received
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="mx-auto -mt-24 max-w-2xl px-6 pb-16">
                    {/* Tip Form Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
                        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            <Heart className="mr-2 inline h-6 w-6 text-pink-500" />
                            Leave a Tip
                        </h2>
                        <Elements stripe={stripePromise}>
                            <TipPaymentForm performer={performer} />
                        </Elements>
                    </div>

                    {/* Bio Section */}
                    {performer.bio && (
                        <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">About</h3>
                            <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                                {performer.bio}
                            </p>
                        </div>
                    )}

                    {/* Upcoming Events */}
                    {upcomingEvents.length > 0 && (
                        <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                <Calendar className="mr-2 inline h-5 w-5" /> Upcoming Shows
                            </h3>
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {event.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(event.event_date).toLocaleDateString()} at{' '}
                                                {event.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
