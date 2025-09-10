import { cn } from "@/lib/utils";
import { FaFacebook, FaGithub, FaGoogle, FaLink, FaLinkedin, FaTwitter } from "react-icons/fa";

const ProviderIcon = ({
    provider,
    className,
}: {
    provider: string;
    className?: string;
}) => {
    function getProviderIcon(provider: string) {
        switch (provider) {
            case "google":
                return FaGoogle;

            case "github":
                return FaGithub;

            case "twitter":
                return FaTwitter;

            case "linkedin":
                return FaLinkedin;

            case "facebook":
                return FaFacebook;

            default:
                return FaLink;
        }
    }

    const ProviderComponent = getProviderIcon(provider);

    return <ProviderComponent className={cn("h-5 w-5", className)} />;
};

export default ProviderIcon;
