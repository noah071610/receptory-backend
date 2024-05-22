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
  rendingSections: SectionType[];
  pageOptions: {
    format: PageFormatType;
    lang: Langs;
    customLink: string;
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

export interface UserPickType {
  title: string;
  value: UserPickValueType[];
  index: number;
  type: string;
}
export interface UserPickValueType {
  key: string;
  text: string;
  description?: string;
  src?: string;
}
