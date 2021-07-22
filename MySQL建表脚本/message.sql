/*
 Navicat MySQL Data Transfer

 Source Server         : root
 Source Server Type    : MySQL
 Source Server Version : 80023
 Source Host           : 127.0.0.1:3306
 Source Schema         : IoT_Platform

 Target Server Type    : MySQL
 Target Server Version : 80023
 File Encoding         : 65001

 Date: 30/06/2021 20:27:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `messageID` int NOT NULL AUTO_INCREMENT,
  `content` varchar(999) DEFAULT NULL,
  `topic` varchar(50) DEFAULT NULL,
  `deviceID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`messageID`),
  KEY `message_ibfk_1` (`deviceID`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`deviceID`) REFERENCES `device` (`deviceID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=457 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
