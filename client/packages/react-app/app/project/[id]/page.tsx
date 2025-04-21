"use client"

import { useParams } from "next/navigation"
import ProjectDetailsPage from "@/components/@shared-components/project-details"

export default function ProjectDetails() {
  const params = useParams()
  const projectId = params.id as string

  return <ProjectDetailsPage projectId={projectId} />
}   