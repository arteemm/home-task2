export type BlogItemType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
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
};