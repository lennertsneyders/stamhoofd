ALTER TABLE `mollie_tokens` ADD COLUMN `createdAt` datetime NOT NULL DEFAULT "2021-08-31 00:00:00" COMMENT '' AFTER `refreshToken`;
ALTER TABLE `mollie_tokens` CHANGE `createdAt` `createdAt` datetime NOT NULL COMMENT '';