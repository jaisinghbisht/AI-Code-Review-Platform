export interface ProjectInfo {
  id: string;
  projectName: string;
  archiveName: string;
  rootDirectory: string;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  totalFiles: number;
  javaFiles: number;
  packageCount: number;
  estimatedLinesOfCode: number;
  mainClass?: string;
  isSpringBootProject: boolean;
  isMavenProject: boolean;
  isGradleProject: boolean;
  uploadTimestamp: string;
  javaFilePaths?: string[];
  packages?: string[];
}

export interface MethodDefinition {
  methodName: string;
  returnType: string;
  visibility: string;
  isStatic: boolean;
  isFinal: boolean;
  isAbstract: boolean;
  lineCount: number;
  parameters?: string[];
  annotations?: string[];
  exceptions?: string[];
}

export interface TypeDefinition {
  typeName: string;
  type: 'CLASS' | 'INTERFACE' | 'ENUM' | 'RECORD';
  visibility: string;
  isAbstract: boolean;
  isFinal: boolean;
  superclassName?: string;
  fieldCount: number;
  methodCount: number;
  constructorCount: number;
  lineCount: number;
  methodDefinitions: MethodDefinition[];
}

export interface CheckstyleViolation {
  id: string;
  sourceName: string;
  severity: string;
  line: number;
  columnNum?: number;
  message: string;
}

export interface FileAnalysis {
  filePath: string;
  packageName?: string;
  lineCount: number;
  typeDefinitions: TypeDefinition[];
  checkstyleViolations?: CheckstyleViolation[];
}

export interface ProjectAnalysis {
  id: string;
  projectId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  totalClasses: number;
  totalInterfaces: number;
  totalEnums: number;
  totalRecords: number;
  totalMethods: number;
  totalFields: number;
  totalConstructors: number;
  analysisTimestamp: string;
  fileAnalyses: FileAnalysis[];
}

export interface ReviewSection {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
}

export interface ProjectReview {
  id: string;
  analysisId: string;
  model: string;
  createdAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  executionTimeMs?: number;
  sections: ReviewSection[];
}
