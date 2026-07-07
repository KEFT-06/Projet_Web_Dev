import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useApp } from '../../lib/AppContext';

export function AboutPage() {
  const { t } = useApp();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-foreground">{t.aboutTitle}</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Introduction */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-lg mb-4 text-foreground">
              {t.aboutIntro1}
            </p>
            <p className="text-lg text-foreground">
              {t.aboutIntro2}
            </p>
          </CardContent>
        </Card>

        {/* Our Story */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">{t.ourStory}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              {t.ourStoryContent}
            </p>
          </CardContent>
        </Card>

        {/* Our Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">{t.ourMission}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                {t.ourMissionContent}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">{t.ourVision}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                {t.ourVisionContent}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">{t.ourCoreValues}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 text-foreground">{t.qualityExcellence}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.qualityExcellenceDesc}
                </p>
              </div>
              
              <div>
                <h3 className="mb-2 text-foreground">{t.customerSatisfaction}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.customerSatisfactionDesc}
                </p>
              </div>
              
              <div>
                <h3 className="mb-2 text-foreground">{t.teamExcellence}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.teamExcellenceDesc}
                </p>
              </div>
              
              <div>
                <h3 className="mb-2 text-foreground">{t.innovation}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.innovationDesc}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-foreground">{t.sustainability}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.sustainabilityDesc}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-foreground">{t.community}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.communityDesc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Makes Us Special */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">{t.whatMakesUsSpecial}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-[#CFBD97] dark:text-[#8B7355]">•</span>
                <span className="text-foreground">{t.expertChefsDecades}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#CFBD97] dark:text-[#8B7355]">•</span>
                <span className="text-foreground">{t.freshLocalIngredients}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#CFBD97] dark:text-[#8B7355]">•</span>
                <span className="text-foreground">{t.loyaltyRewardsProgram}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#CFBD97] dark:text-[#8B7355]">•</span>
                <span className="text-foreground">{t.exceptionalCustomerService}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#CFBD97] dark:text-[#8B7355]">•</span>
                <span className="text-foreground">{t.regularEventsExperiences}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#CFBD97] dark:text-[#8B7355]">•</span>
                <span className="text-foreground">{t.commitmentSustainability}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Hours of Operation */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">{t.hoursOfOperation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t.mondayFriday}</p>
                <p className="text-foreground">11:00 AM - 10:00 PM</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.saturdaySunday}</p>
                <p className="text-foreground">10:00 AM - 11:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
