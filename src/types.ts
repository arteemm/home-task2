export type BlogItemType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type RequestBody = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type PostItemType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type RequestPostBody = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
};