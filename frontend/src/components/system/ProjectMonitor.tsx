import { v4 as uuidv4 } from 'uuid';
import { useAICStore } from '@/store/AICStore';
import { useEffect, useRef } from 'react';
import { FullScreenSpinner } from './FullScreenSpinner';
import { useLocation, useNavigate } from 'react-router-dom';

export function RouteMonitor({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isProjectOpen = useAICStore((state) => state.isProjectOpen);

  const projectPath = useAICStore((state) => state.projectPath);
  const pathRef = useRef<string | undefined>(undefined);
  const isProjectLoading = useAICStore((state) => state.isProjectLoading);

  useEffect(() => {
    if (isProjectLoading) {
      return;
    }

    // identify initial project
    if (pathRef.current === undefined) {
      pathRef.current = projectPath;
    }

    //when we open or close a project we want to reset the url
    if (pathRef.current !== projectPath) {
      if (isProjectOpen) {
        navigate(`/chats/${uuidv4()}`);
      } else {
        navigate('/');
      }

      pathRef.current = projectPath || '';
    }
  }, [projectPath, isProjectOpen, isProjectLoading, navigate]);

  useEffect(() => {
    if (isProjectLoading) {
      return;
    }

    // For some reason we are in project url and there is no project
    if (!isProjectOpen && location.pathname !== '/') {
      navigate('/');
    }

    // For some reason we have a project and we are in home
    if (isProjectOpen && location.pathname === '/') {
      navigate(`/chats/${uuidv4()}`);
    }

  }, [isProjectOpen, isProjectLoading, location.pathname, navigate]);

  if (isProjectLoading) {
    return <FullScreenSpinner />;
  }

  return children;
}
