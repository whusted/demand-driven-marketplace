export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_LISTING = 5;
export const MAX_IMAGES_PER_OFFER = 10;
export const MAX_BIO_LENGTH = 500;
export const MAX_TITLE_LENGTH = 200;
export const MIN_TITLE_LENGTH = 5;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MIN_DESCRIPTION_LENGTH = 20;
export const MAX_OFFER_DESCRIPTION_LENGTH = 2000;
export const MIN_OFFER_DESCRIPTION_LENGTH = 10;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_COMMENT_LENGTH = 1000;
export const MAX_USERNAME_LENGTH = 30;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_ALERTS_PER_USER = 20;
export const MAX_KEYWORDS_PER_ALERT = 10;
export const MAX_TAG_LENGTH = 50;

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
