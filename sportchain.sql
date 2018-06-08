-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: sportchain
-- ------------------------------------------------------
-- Server version	5.7.22-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity`
--

DROP TABLE IF EXISTS `activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shopName` varchar(50) NOT NULL,
  `isAlliance` tinyint(1) NOT NULL,
  `beginTime` bigint(15) NOT NULL,
  `endTime` bigint(15) NOT NULL,
  `totalCoupons` int(10) NOT NULL,
  `realCoupons` int(10) NOT NULL,
  `discount` decimal(4,3) NOT NULL,
  `url` varchar(100) NOT NULL,
  `energy` int(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity`
--

LOCK TABLES `activity` WRITE;
/*!40000 ALTER TABLE `activity` DISABLE KEYS */;
INSERT INTO `activity` VALUES (1,'pinvon',0,1527926400000,1529564400000,100,100,7.800,'www.anta.com',10),(2,'anta',0,1527991200000,1528077000000,200,0,6.300,'www.anta.com',30);
/*!40000 ALTER TABLE `activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enterpriseShop`
--

DROP TABLE IF EXISTS `enterpriseShop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enterpriseShop` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `enterpriseName` varchar(50) DEFAULT NULL,
  `shopLogo` varchar(50) DEFAULT NULL,
  `registerationNumber` varchar(50) DEFAULT NULL,
  `organizationCode` varchar(50) DEFAULT NULL,
  `legalAttribution` varchar(50) DEFAULT NULL,
  `legalRepresentative` varchar(50) DEFAULT NULL,
  `businessLicense` varchar(50) DEFAULT NULL,
  `organizationCodeCertificate` varchar(50) DEFAULT NULL,
  `identitiesPositive` varchar(50) DEFAULT NULL,
  `identitiesReversed` varchar(50) DEFAULT NULL,
  `shoplink` varchar(50) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(25) NOT NULL,
  `energy` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `enterpriseName` (`enterpriseName`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enterpriseShop`
--

LOCK TABLES `enterpriseShop` WRITE;
/*!40000 ALTER TABLE `enterpriseShop` DISABLE KEYS */;
INSERT INTO `enterpriseShop` VALUES (1,'自然堂','CUsersCHENDesktop项目sportchain','12345678909889988','1111111111111111111111','厦门','白富美','C:UsersCHENDesktop','235335345654654674546','C:UsersCHENDesktop项目sportchainbootstrap-4.1.1','https:hao.360.cn?360','https://hao.360.cn/?360safe','13475868789','123434350000@qq.com','12340000',NULL),(2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13559978625',NULL,'123456',NULL),(3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238667',NULL,'123456',NULL),(4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238668',NULL,'123456',NULL),(5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238669',NULL,'123456',NULL),(6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238670',NULL,'123456',NULL),(7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238671',NULL,'123456',NULL),(8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238672',NULL,'111111',NULL),(9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'15906666408',NULL,'123456',NULL);
/*!40000 ALTER TABLE `enterpriseShop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personalShop`
--

DROP TABLE IF EXISTS `personalShop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personalShop` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `shopname` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `introduction` varchar(255) DEFAULT NULL,
  `shoplogo` varchar(50) DEFAULT NULL,
  `shoplink` varchar(50) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `password` varchar(25) NOT NULL,
  `energy` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `shopname` (`shopname`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personalShop`
--

LOCK TABLES `personalShop` WRITE;
/*!40000 ALTER TABLE `personalShop` DISABLE KEYS */;
INSERT INTO `personalShop` VALUES (1,'DIDADI','服装','本店物美价廉','https://hao.360.cn/?360safe','https://hao.360.cn/?360safe','12345768908','123434350000@qq.com','12340000',NULL),(2,'aa','默认类型','请输入您的店铺介绍','13459238667','http://www.pdfbook.cn/category/14/1402','13459238667',NULL,'123456',NULL),(3,NULL,NULL,NULL,NULL,NULL,'13559978625',NULL,'123456',NULL),(4,NULL,NULL,NULL,NULL,NULL,'13559978626',NULL,'123456',NULL),(5,NULL,NULL,NULL,NULL,NULL,'15906666409',NULL,'123456',NULL);
/*!40000 ALTER TABLE `personalShop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shops`
--

DROP TABLE IF EXISTS `shops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shops` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `url` varchar(50) DEFAULT NULL,
  `energy` int(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shops`
--

LOCK TABLES `shops` WRITE;
/*!40000 ALTER TABLE `shops` DISABLE KEYS */;
INSERT INTO `shops` VALUES (1,'shop1','www.anta.com',300),(2,'pinvon','www.adidas.com',500),(3,'anta','www.anta.com',100);
/*!40000 ALTER TABLE `shops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `phone` varchar(25) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(25) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL,
  `activity_id` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('135785678999','123434355654@qq.com','12345678',1,'',0,NULL),('13578567000','123434350000@qq.com','12340000',2,'',0,NULL),('13805976666','hello@163.com','123456',3,'cy',0,NULL),('13805976666','hello@163.com','123456',4,'ccy',0,NULL),('13805976666','hello@163.com','123456',5,'ccyy',0,NULL),('13805976666','hello@163.com','123456789',6,'ccyycy',0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-06-08 17:21:03
