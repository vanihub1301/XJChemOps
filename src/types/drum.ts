export interface IDrum {
    id: string;
    code: string;
    name: string;
    isRegister: boolean;
}

export interface Batchs {
    id: string;
    orderNo: string;
    bomNo: string;
    color: string;
    thickness: string;
    startDrum: string;
    drumNo: string;
    employee: string;
    isFinish: boolean;
    materialNo: string;
    materialName: string;
    type: string;
    finishTime: string | null;
    lastUpdateTime: string | null;
    dtl: Chemical[];
}

export interface Chemical {
    id: string;
    processFk: string;
    seqNo: number;
    processCode: string;
    processName: string;
    materialCode: string;
    materialName: string;
    percent: number;
    actualWeight: number;
    operateTime: number;
    isAppend: boolean;
    pipelineNo: string;
    confirmUser: string | null;
    confirmTime: string;
    realConfirmTime: string | null;
    autoFeed: boolean;
    videoFk: string | null;
}