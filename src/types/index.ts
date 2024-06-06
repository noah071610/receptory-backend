export type Langs = 'ko' | 'en' | 'th' | 'ja';
export type PageFormatType = 'inactive' | 'active';

export interface SectionType {
  id: string;
  index: number;
  type: string;
  value: any;
  text: string;
  data: { [key: string]: any };
  collection: any[];
  src: string;
  isActive: boolean;
  list: SectionType[];
  style: { [key: string]: string };
  design: string;
  options: { [key: string]: any };
}

export interface PageContentType {
  homeSections: SectionType[];
  formSections: SectionType[];
  confirmSections: SectionType[];
  pageOptions: {
    format: PageFormatType;
    lang: Langs;
    customLink: string;
    isUseThumbnailEmbed: boolean;
    isNotUseCustomLink: boolean;
    embed: {
      title: string;
      description: string;
      src: string;
    };
  };
}
export interface SaveContentType extends PageContentType {
  stage: string;
  currentUsedImages: string[];
  currentUsedColors: string[];
}

interface _Save {
  pageId: string;
  title: string;
  description: string;
  format: PageFormatType;
  thumbnail: string;
  lang: Langs;
}

export interface SaveType extends _Save {
  content: SaveContentType;
}
export interface PageType extends _Save {
  content: PageContentType;
}

export interface SelectedType {
  id: string;
  title: string;
  type: string;
  value: SelectedValueType[];
}
export interface SelectedValueType {
  key: string;
  text: string;
  description?: string;
  src?: string;
}

export interface DateAnalyserType {
  [yearMonth: string]: number[];
}
export interface SelectAnalyserType {
  [sectionId: string]: {
    [itemKey: string]: number;
  };
}
export interface TimeAnalyserType {
  AM: number[];
  PM: number[];
}

export interface AnalyserType {
  submit: DateAnalyserType;
  calendar: DateAnalyserType;
  time: TimeAnalyserType;
  select: SelectAnalyserType;
  choices: SelectAnalyserType;
}
