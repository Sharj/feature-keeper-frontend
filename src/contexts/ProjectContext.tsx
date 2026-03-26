"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { projects as projectsApi } from "@/lib/api";
import type { Project } from "@/types";

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  selectProject: (id: number) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectState | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    if (!token) return;
    try {
      const res = await projectsApi.list(token);
      setProjects(res.data);
      const savedId = localStorage.getItem("fk_current_project");
      const saved = savedId ? res.data.find((p) => p.id === Number(savedId)) : null;
      const selected = saved || res.data[0] || null;
      setCurrentProject(selected);
      if (selected) localStorage.setItem("fk_current_project", String(selected.id));
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  function selectProject(id: number) {
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setCurrentProject(proj);
      localStorage.setItem("fk_current_project", String(id));
    }
  }

  return (
    <ProjectContext.Provider value={{ currentProject, projects, isLoading, selectProject, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within ProjectProvider");
  return context;
}
