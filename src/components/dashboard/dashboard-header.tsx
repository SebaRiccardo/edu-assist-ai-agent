'use client'
import Link from "next/link"
import { useMemo } from "react"
import { useParams, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeft, Plus, Plug, Settings2, Sparkles, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useCurrentUser, useUserDisplayName } from "@/hooks/use-current-user"
import { useCourse } from "@/hooks/use-courses"
import { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"

type HeaderCta = {
    href: string
    labelKey: string
    icon: LucideIcon
    variant?: "default" | "secondary" | "outline"
}

type HeaderCopy = {
    titleKey?: string
    descriptionKey?: string
    cta?: HeaderCta
    backButton?: HeaderCta
}

const DashboardHeader = ({ user }: { user: User }) => {
    const pathname = usePathname()
    const params = useParams<{ id?: string }>()
    const tDashboard = useTranslations("Dashboard")
    const tCourseDetails = useTranslations('CourseDetails');
    const tHeader = useTranslations("DashboardHeader")
    const { loading: userLoading } = useCurrentUser(user)
    const displayName = useUserDisplayName(user)

    const courseId = useMemo(() => {
        const paramValue = params?.id
        if (!paramValue) return undefined
        return Array.isArray(paramValue) ? paramValue[0] : paramValue
    }, [params])

    const isCourseAutoLabelRoute = pathname.startsWith("/dashboard/courses/") && pathname.includes("/auto-label")
    const isCourseDetailRoute = pathname.startsWith("/dashboard/courses/") && !isCourseAutoLabelRoute

    const { data: courseData, isLoading: isCourseLoading } = useCourse(isCourseDetailRoute ? courseId : undefined)

    const headerCopy: HeaderCopy = useMemo(() => {
        if (pathname === "/dashboard") {
            return {
                titleKey: "overview.title",
                descriptionKey: "overview.description",
                cta: {
                    href: "/dashboard/courses?create=true",
                    labelKey: "overview.cta",
                    icon: Plus,
                },
            }
        }

        if (isCourseAutoLabelRoute) {
            return {
                titleKey: "courseAutoLabel.title",
                descriptionKey: "courseAutoLabel.description",
                backButton: {
                    href: courseId ? `/dashboard/courses/${courseId}` : "/dashboard/courses",
                    labelKey: "courseAutoLabel.cta",
                    icon: ArrowLeft,
                    variant: "outline",
                },
            }
        }

        if (isCourseDetailRoute) {
            return {
                titleKey: "courseDetail.title",
                descriptionKey: "courseDetail.description",
                backButton: courseId
                    ? {
                        href: "/dashboard/courses",
                        labelKey: "courseDetail.cta",
                        icon: ArrowLeft,
                        variant: "outline",
                    }
                    : undefined,
            }
        }

        if (pathname.startsWith("/dashboard/courses")) {
            return {
                titleKey: "courses.title",
                descriptionKey: "courses.description",
                cta: {
                    href: "/dashboard/courses?create=true",
                    labelKey: "courses.cta",
                    icon: Plus,
                },
            }
        }

        if (pathname.startsWith("/dashboard/chat")) {
            return {
                titleKey: "chat.title",
                descriptionKey: "chat.description",
                cta: {
                    href: "/dashboard/chat",
                    labelKey: "chat.cta",
                    icon: Sparkles,
                },
            }
        }

        if (pathname.startsWith("/dashboard/connections")) {
            return {
                titleKey: "connections.title",
                descriptionKey: "connections.description",
                // cta: {
                //     href: "/dashboard/connections?connect=true",
                //     labelKey: "connections.cta",
                //     icon: Plug,
                // },
            }
        }

        if (pathname.startsWith("/dashboard/settings")) {
            return {
                titleKey: "settings.title",
                descriptionKey: "settings.description",
                cta: {
                    href: "/dashboard/settings#profile",
                    labelKey: "settings.cta",
                    icon: Settings2,
                    variant: "outline",
                },
            }
        }

        return {
            titleKey: "fallback.title",
            descriptionKey: "fallback.description",
            cta: {
                href: "/dashboard",
                labelKey: "fallback.cta",
                icon: ArrowLeft,
                variant: "outline",
            },
        }
    }, [courseId, isCourseAutoLabelRoute, isCourseDetailRoute, pathname])

    const nameForGreeting = displayName ?? user.email ?? ""
    const translatedTitle = headerCopy.titleKey ? tHeader(headerCopy.titleKey, { name: nameForGreeting }) : ""
    const translatedDescription = headerCopy.descriptionKey ? tHeader(headerCopy.descriptionKey, { name: nameForGreeting }) : ""

    let title = translatedTitle
    let description = translatedDescription

    if (pathname === "/dashboard" && userLoading) {
        title = tDashboard("loading")
    }

    if (isCourseDetailRoute) {
        if (isCourseLoading) {
            title = tDashboard("loading")
        } else {
            title = courseData?.name?.trim() ? courseData.name.trim() : translatedTitle
            const courseDescription = courseData?.description?.trim()
            description = courseDescription && courseDescription.length > 0 ? courseDescription : translatedDescription
        }
    }

    if (pathname == "/dashboard/chat") return null

    //group-has-data-[collapsible=icon]/sidebar-wrapper:h-16
    return (
        <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex rounded-md h-20 shrink-0 border-none items-center gap-2 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2 px-4 w-full">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                {headerCopy.backButton && (
                    <Button
                        size="lg"
                        variant={headerCopy.backButton.variant ?? "default"}
                        className="gap-2 rounded-xl h-12 border-none"
                        asChild
                    >
                        <Link href={headerCopy.backButton.href}>
                            <headerCopy.backButton.icon className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
                <div className="flex items-center justify-between w-full flex-1">
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                            {courseData &&
                                <>
                                    <Badge>{courseData?.year}</Badge>
                                    {courseData?.student_count > 0 && (
                                        <Badge variant="info">{tCourseDetails('students', { count: courseData?.student_count })}</Badge>
                                    )}
                                </>
                            }
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1">{description}</p>
                    </div>

                </div>
                {headerCopy.cta && (
                    <Button
                        size="lg"
                        variant={headerCopy.cta.variant ?? "default"}
                        className="gap-2 rounded-xl h-12"
                        asChild
                    >
                        <Link href={headerCopy.cta.href}>
                            <headerCopy.cta.icon className="h-4 w-4" />
                            {tHeader(headerCopy.cta.labelKey)}
                        </Link>
                    </Button>
                )}
            </div>
        </header >
    )
}

export default DashboardHeader