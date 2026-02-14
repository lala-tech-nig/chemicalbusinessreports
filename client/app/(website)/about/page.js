import React from 'react';
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
    title: 'About Us - Chemical Business Reports',
    description: 'Learn more about Chemical Business Reports, our mission, and our team.',
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <SectionHeader title="About Us" subtitle="Who We Are" />

            <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                    Welcome to **Chemical Business Reports**, your premier source for in-depth analysis, market trends, and corporate profiles within the chemical industry.
                </p>
                <p>
                    Our mission is to provide industry leaders, researchers, and stakeholders with accurate, timely, and actionable intelligence. We cover a wide range of sectors, from petrochemicals to specialty chemicals, offering a unique blend of improved data and expert commentary.
                </p>
                <p>
                    Whether you are looking for the latest news roundups, detailed research reports, or insights into emerging startups, Chemical Business Reports is designed to keep you ahead of the curve.
                </p>

                <div className="mt-12 p-8 bg-muted/30 rounded-2xl border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Contact Us</h3>
                    <p>
                        Have questions or want to get in touch? Reach out to us at:
                        <br />
                        <a href="mailto:info@chemicalbusinessreports.net" className="text-primary hover:underline font-medium">
                            info@chemicalbusinessreports.net
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
