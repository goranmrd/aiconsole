import { BlinkingCursor } from '@/components/BlinkingCursor';
import { cn } from '@/utils/styles';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { UserInfo } from '@/components/UserInfo';


export function Analysis() {
  const analysis = useAnalysisStore();

  if (analysis.isAnalysisRunning || analysis.thinking_process) {
    return <div
      className={cn('flex flex-row shadow-md border-t border-gray-900/50 py-10 text-stone-400/50',)}
    >
      <div className="container flex mx-auto gap-5">
        <UserInfo
          agent_id={analysis.agent_id !== 'user' ? analysis.agent_id || '' : ''}
          materials_ids={analysis.agent_id !== 'user' ? analysis.relevant_material_ids || [] : []} />
        <div className="flex-grow mr-20">
          Analysing ...
          {` ${analysis.thinking_process || ''}`} {analysis.next_step && <><br/> Next step: <span className="text-secondary/50">{analysis.next_step}</span></>} {analysis.isAnalysisRunning && <BlinkingCursor/>}
        </div>
      </div>
    </div>
  } else {
    return <></>
  }
}
