// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export type SequenceStage = 'start' | 'middle' | 'end';

export type UpdateAnalysisWSMessage = {
  request_id: string;
  type: 'UpdateAnalysisWSMessage';
  stage: SequenceStage;
  agent_id?: string;
  relevant_material_ids?: string[];
  next_step?: string;
  thinking_process?: string;
};

export type UpdateMessageWSMessage = {
  request_id: string;
  type: 'UpdateMessageWSMessage';
  id: string;
  stage: SequenceStage;
  text_delta?: string;
};

export type ResetMessageWSMessage = {
  request_id: string;
  type: 'ResetMessageWSMessage';
  id: string;
};

export type UpdateToolCallWSMessage = {
  request_id: string;
  type: 'UpdateToolCallWSMessage';
  id: string;
  stage: SequenceStage;
  language?: string;
  code_delta?: string;
  headline_delta?: string;
};

export type UpdateToolCallOutputWSMessage = {
  request_id: string;
  type: 'UpdateToolCallOutputWSMessage';
  id: string;
  stage: SequenceStage;
  output_delta?: string;
};

export type RequestProcessingFinishedWSMessage = {
  request_id: string;
  aborted: boolean;
  type: 'RequestProcessingFinishedWSMessage';
};

export type ChatWSMessage =
  | UpdateAnalysisWSMessage
  | UpdateMessageWSMessage
  | ResetMessageWSMessage
  | UpdateToolCallWSMessage
  | UpdateToolCallOutputWSMessage
  | RequestProcessingFinishedWSMessage;
