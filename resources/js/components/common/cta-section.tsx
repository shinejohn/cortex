import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export const CTASection = () => {
    return (
        <div className="py-8 bg-muted/30">
            <div className="max-w-5xl mx-auto px-3 sm:px-4">
                <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80 shadow-lg">
                    <CardContent className="p-8 sm:p-12">
                        <div className="text-center space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">Ready to discover more events?</h3>
                                <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                                    Join thousands of locals finding the best things to do in Clearwater every day
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                                <Button
                                    size="lg"
                                    onClick={() => (window.location.href = "/events")}
                                    className="min-w-[160px] shadow-md hover:shadow-lg transition-shadow"
                                >
                                    Explore all events
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="lg" onClick={() => (window.location.href = "/register")} className="min-w-[160px]">
                                    Sign up
                                </Button>
                            </div>

                            {/* Social proof indicator */}
                            <div className="pt-4">
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background" />
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-background" />
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background" />
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-background" />
                                    </div>
                                    <span>Trusted by thousands in Clearwater</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CTASection;
