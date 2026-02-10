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
            title="Post a Listing"
            description="Fill out the form below to create your classified listing."
            backHref={route("daynews.classifieds.index") as any}
            backLabel="Back to Classifieds"
            maxWidth="max-w-3xl"
        >
            <ClassifiedForm
                categories={categories}
                conditions={conditions}
                priceTypes={priceTypes}
                mode="create"
            />
        </FormLayout>
    );
}
