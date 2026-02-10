import { ClassifiedForm } from "@/components/day-news/classified-form";
import FormLayout from "@/layouts/form-layout";
import type { Auth } from "@/types";
import type { ClassifiedCreatePageProps } from "@/types/classified";
import { route } from "ziggy-js";

interface Props extends ClassifiedCreatePageProps {
    auth: Auth;
}

export default function ClassifiedCreate({ auth, categories, conditions, priceTypes }: Props) {
    return (
        <FormLayout
            title="Post a Classified Ad"
            description="List your items, services, or opportunities in the community classifieds."
            backHref={route("daynews.classifieds.index") as any}
            backLabel="Back to Classifieds"
            maxWidth="max-w-3xl"
        >
            <div className="overflow-hidden rounded-lg bg-white shadow-sm p-6">
                <ClassifiedForm
                    categories={categories}
                    conditions={conditions}
                    priceTypes={priceTypes}
                    mode="create"
                />
            </div>

            {/* Pricing info sidebar */}
            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Classified Ad Pricing
                </h3>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="mr-2 mt-0.5 flex-shrink-0 text-green-500">
                            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Base Price: $10/month</p>
                            <p className="text-sm text-gray-500">Includes listing in up to 3 communities</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="mr-2 mt-0.5 flex-shrink-0 text-green-500">
                            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Additional Communities: $2/each</p>
                            <p className="text-sm text-gray-500">Extend your reach to more communities</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="mr-2 mt-0.5 flex-shrink-0 text-green-500">
                            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Minimum Duration: 1 month</p>
                            <p className="text-sm text-gray-500">Longer durations available at discounted rates</p>
                        </div>
                    </div>
                </div>
            </div>
        </FormLayout>
    );
}
