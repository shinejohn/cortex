import Header from "@/components/common/header";
import { type SharedData } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Header auth={auth} />
        </>
    );
}
