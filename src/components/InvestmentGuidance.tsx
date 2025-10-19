import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Youtube } from "lucide-react";

const YOUTUBE_CHANNELS = [
  {
    name: "The Financial Diet",
    description: "Personal finance, budgeting, and smart money habits",
    url: "https://www.youtube.com/@thefinancialdiet"
  },
  {
    name: "Graham Stephan",
    description: "Real estate investing and wealth building strategies",
    url: "https://www.youtube.com/@GrahamStephan"
  },
  {
    name: "Andrei Jikh",
    description: "Stock market investing and financial freedom",
    url: "https://www.youtube.com/@AndreiJikh"
  },
  {
    name: "Meet Kevin",
    description: "Stock analysis, real estate, and market insights",
    url: "https://www.youtube.com/@MeetKevin"
  }
];

const JAMAICAN_AGENCIES = [
  {
    name: "NCB Capital Markets",
    description: "Full-service investment banking and brokerage services",
    phone: "1-888-622-3477",
    website: "https://www.jncb.com/capital-markets",
    services: ["Stocks", "Bonds", "Mutual Funds", "Portfolio Management"]
  },
  {
    name: "JMMB Securities",
    description: "Investment solutions and wealth management",
    phone: "(876) 998-5662",
    website: "https://www.jmmb.com",
    services: ["Investment Portfolios", "Retirement Planning", "Financial Advisory"]
  },
  {
    name: "VMBS (Victoria Mutual Building Society)",
    description: "Savings and investment solutions",
    phone: "(876) 754-8512",
    website: "https://www.vmbs.com",
    services: ["Savings Plans", "Investment Products", "Loans"]
  }
];

export const InvestmentGuidance = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <CardTitle>Start Your Investment Journey</CardTitle>
          </div>
          <CardDescription>
            Investing is one of the most powerful ways to build wealth over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Why Invest?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Beat inflation and grow your money over time</li>
              <li>Create passive income streams</li>
              <li>Build long-term financial security</li>
              <li>Achieve financial goals faster</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Getting Started Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Start small - even $10 a week adds up</li>
              <li>Diversify your investments to reduce risk</li>
              <li>Think long-term and be patient</li>
              <li>Educate yourself before making decisions</li>
              <li>Consider seeking professional advice</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" />
          Learn from YouTube Channels
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {YOUTUBE_CHANNELS.map((channel) => (
            <Card key={channel.name}>
              <CardHeader>
                <CardTitle className="text-lg">{channel.name}</CardTitle>
                <CardDescription>{channel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href={channel.url} target="_blank" rel="noopener noreferrer">
                    <Youtube className="w-4 h-4 mr-2" />
                    Watch Channel
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Professional Investment Services in Jamaica</h3>
        <div className="space-y-4">
          {JAMAICAN_AGENCIES.map((agency) => (
            <Card key={agency.name}>
              <CardHeader>
                <CardTitle>{agency.name}</CardTitle>
                <CardDescription>{agency.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Phone:</span> {agency.phone}
                  </p>
                  <div>
                    <p className="font-semibold text-sm mb-1">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {agency.services.map((service) => (
                        <span key={service} className="text-xs bg-secondary px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <a href={agency.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
