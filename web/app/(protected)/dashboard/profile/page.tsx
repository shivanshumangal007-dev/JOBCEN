"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store/useStore";
import { ArrowLeft, Briefcase, GraduationCap, MapPin, Mail, Phone, Link as LinkIcon, Award, Code, Globe, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FullProfilePage() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh]">
        <h1 className="text-2xl font-medium mb-4">Profile not found</h1>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-5xl mx-auto w-full p-8 md:py-16">
      
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>

      <header className="mb-12">
        <h1 className="text-5xl font-heading font-medium text-primary uppercase tracking-tight mb-4">
          {profile.full_name}
        </h1>
        {profile.primary_role && (
          <h2 className="text-2xl text-muted-foreground font-light mb-4">{profile.primary_role}</h2>
        )}
        <p className="text-lg max-w-3xl font-light text-foreground/90">
          {profile.bio}
        </p>
      </header>

      <div className="grid md:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="md:col-span-8 space-y-12">
          
          {/* Experience Section */}
          {profile.experience && profile.experience.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Briefcase className="w-6 h-6" />
                <h3 className="text-3xl font-heading font-medium">Experience</h3>
              </div>
              <div className="space-y-6">
                {profile.experience.map((exp, i) => (
                  <Card key={i} className="p-6 rounded-none bg-card hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-xl font-medium">{exp.title}</h4>
                        <p className="text-primary font-medium">{exp.company}</p>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <div>{exp.start_date} - {exp.end_date || "Present"}</div>
                        {exp.location && <div>{exp.location}</div>}
                      </div>
                    </div>
                    {exp.description && exp.description.length > 0 && (
                      <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground text-sm">
                        {exp.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {exp.technologies.map((tech, idx) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 uppercase tracking-wider">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {profile.education && profile.education.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <GraduationCap className="w-6 h-6" />
                <h3 className="text-3xl font-heading font-medium">Education</h3>
              </div>
              <div className="space-y-6">
                {profile.education.map((edu, i) => (
                  <Card key={i} className="p-6 rounded-none bg-card hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-xl font-medium">{edu.institution}</h4>
                        <p className="text-primary font-medium">{edu.degree} in {edu.field_of_study}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Class of {edu.graduation_year}
                      </div>
                    </div>
                    {edu.gpa && (
                      <p className="text-sm text-muted-foreground mt-2">GPA: {edu.gpa}{edu.max_gpa ? ` / ${edu.max_gpa}` : ''}</p>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          {profile.projects && profile.projects.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Code className="w-6 h-6" />
                <h3 className="text-3xl font-heading font-medium">Projects</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.projects.map((proj, i) => (
                  <Card key={i} className="p-6 rounded-none bg-card hover:border-primary/50 transition-colors flex flex-col">
                    <h4 className="text-lg font-medium mb-2">{proj.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {proj.technologies.map((tech, idx) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 uppercase tracking-wider">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar Area */}
        <div className="md:col-span-4 space-y-8">
          
          <Card className="p-6 rounded-none bg-primary/5 border-none">
            <h3 className="text-xl font-heading font-medium mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Contact
            </h3>
            <div className="space-y-4 text-sm">
              {profile.contact?.address && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" /> {profile.contact.address}
                </div>
              )}
              {profile.contact?.phone_number && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" /> {profile.contact.phone_number}
                </div>
              )}
              {/* Note: Email is on the user object, but we'll leave it out if not in profile */}
            </div>
          </Card>

          {(profile.socials?.github || profile.socials?.linkedin || profile.socials?.portfolio || (profile.socials?.websites && profile.socials.websites.length > 0)) && (
            <Card className="p-6 rounded-none bg-card">
              <h3 className="text-xl font-heading font-medium mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Links
              </h3>
              <div className="space-y-3 text-sm">
                {profile.socials.linkedin && (
                  <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <LinkIcon className="w-4 h-4 shrink-0" /> LinkedIn
                  </a>
                )}
                {profile.socials.github && (
                  <a href={profile.socials.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <LinkIcon className="w-4 h-4 shrink-0" /> GitHub
                  </a>
                )}
                {profile.socials.portfolio && (
                  <a href={profile.socials.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <LinkIcon className="w-4 h-4 shrink-0" /> Portfolio
                  </a>
                )}
                {profile.socials.websites?.map((site, i) => (
                  <a key={i} href={site} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <LinkIcon className="w-4 h-4 shrink-0" /> Website {i + 1}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <Card className="p-6 rounded-none bg-card">
              <h3 className="text-xl font-heading font-medium mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="text-xs bg-muted text-muted-foreground px-3 py-1 uppercase tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
