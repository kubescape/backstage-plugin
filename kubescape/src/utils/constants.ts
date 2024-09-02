export type ResoureceWithImage =
  | 'Pod'
  | 'ReplicaSet'
  | 'Deployment'
  | 'StatefulSet'
  | 'DaemonSet'
  | 'Job'
  | 'CronJob';

export const ResourecesWithImage = {
  Pod: true,
  ReplicaSet: true,
  Deployment: true,
  StatefulSet: true,
  DaemonSet: true,
  Job: true,
  CronJob: true,
};
