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

 Date: 30/06/2021 20:27:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for device
-- ----------------------------
DROP TABLE IF EXISTS `device`;
CREATE TABLE `device` (
  `deviceID` varchar(50) NOT NULL,
  `ownerName` varchar(50) DEFAULT 'liuwei',
  `deviceName` varchar(50) DEFAULT NULL,
  `isOnline` tinyint DEFAULT '0',
  PRIMARY KEY (`deviceID`),
  KEY `device_ibfk_1` (`ownerName`),
  CONSTRAINT `device_ibfk_1` FOREIGN KEY (`ownerName`) REFERENCES `user` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
