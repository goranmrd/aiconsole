import { v4 as uuidv4 } from 'uuid';
import { useAICStore } from '@/store/AICStore';
import { useEffect, useRef } from 'react';
import { FullScreenSpinner } from './FullScreenSpinner';
import { useLocation, useNavigate } from 'react-router-dom';

export function RouteMonitor({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isProjectOpen = useAICStore((state) => state.isProjectOpen());

  const projectPath = useAICStore((state) => state.projectPath);
  const pathRef = useRef<string | undefined>(undefined);
  const isProjectLoading = useAICStore((state) => state.isProjectLoading());

  useEffect(() => {
    // identify current project
    if (pathRef.current === undefined && projectPath !== undefined) {
      pathRef.current = projectPath;
    }

    //when we open or close a project we want to reset the url
    if (pathRef.current !== projectPath) {
      if (isProjectOpen) {
        navigate(`/chats/${uuidv4()}`);
      } else if (!isProjectLoading) {
        navigate('/');
      }

      pathRef.current = projectPath || '';
    }
  }, [projectPath, isProjectOpen, isProjectLoading, navigate]);

  useEffect(() => {
    // For some reason we are in chat there is no project
    if (!isProjectOpen && location.pathname.startsWith('/chat')) {
      navigate('/');
    }

    // For some reason we have a project and we are in home
    if (isProjectOpen && location.pathname === '/') {
      navigate(`/chats/${uuidv4()}`);
    }
  }, [isProjectOpen, location, navigate]);

  if (isProjectLoading) {
    return <FullScreenSpinner />;
  }

  return children;
}
