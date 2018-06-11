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
  `shopphone` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity`
--

LOCK TABLES `activity` WRITE;
/*!40000 ALTER TABLE `activity` DISABLE KEYS */;
INSERT INTO `activity` VALUES (1,'pinvon',0,1527926400000,1529564400000,100,100,7.800,'www.anta.com',10,'13559978625'),(2,'anta',0,1527991200000,1528077000000,200,0,6.300,'www.anta.com',30,NULL),(3,'nike',0,1528619400000,1529307000000,100,0,7.800,'www.nike.com',100,NULL),(4,'tebu',0,1528689600000,1528866000000,100,0,7.800,'www.TTTTTebu',10,NULL),(5,'特步',0,1529035800000,1529467200000,100,0,7.800,'https://www.xtep.com',20,NULL),(6,'卡帕',0,1529035200000,1529510400000,100,0,8.500,'http://www.ikappa.com.cn/',20,NULL);
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
  `shoplink` varchar(1000) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(25) NOT NULL,
  `energy` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `enterpriseName` (`enterpriseName`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enterpriseShop`
--

LOCK TABLES `enterpriseShop` WRITE;
/*!40000 ALTER TABLE `enterpriseShop` DISABLE KEYS */;
INSERT INTO `enterpriseShop` VALUES (1,'自然堂','CUsersCHENDesktop项目sportchain','12345678909889988','1111111111111111111111','厦门','白富美','C:UsersCHENDesktop','235335345654654674546','C:UsersCHENDesktop项目sportchainbootstrap-4.1.1','https:hao.360.cn?360','http://10.8.13.147:3000/upload/18659288771/weixi.png','13475868789','123434350000@qq.com','12340000',NULL),(2,'斯伯丁','www.baidu.com',NULL,NULL,NULL,'优惠活动限时秒杀',NULL,NULL,NULL,NULL,'http://img.mukewang.com/55237dcc0001128c06000338.jpg','13559978625',NULL,'123456',NULL),(3,'一格运动店','www.baidu.com',NULL,NULL,NULL,'优惠活动限时秒杀',NULL,NULL,NULL,NULL,'http://img.mukewang.com/55249cf30001ae8a06000338-300-170.jpg','13459238667',NULL,'123456',NULL),(4,'沃特运动旗舰店','www.baidu.com',NULL,NULL,NULL,'优惠活动限时秒杀',NULL,NULL,NULL,NULL,'http://img.mukewang.com/5523711700016d1606000338-300-170.jpg','13459238668',NULL,'123456',NULL),(5,'盛达运动','www.baidu.com',NULL,NULL,NULL,'优惠活动限时秒杀',NULL,NULL,NULL,NULL,'http://img.mukewang.com/551e470500018dd806000338-300-170.jpg','13459238669',NULL,'123456',NULL),(6,'安踏健驰','www.baidu.com',NULL,NULL,NULL,'优惠活动限时秒杀',NULL,NULL,NULL,NULL,'http://img.mukewang.com/551de0570001134f06000338-300-170.jpg','13459238670',NULL,'123456',NULL),(7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238671',NULL,'123456',NULL),(8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'13459238672',NULL,'111111',NULL),(9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'15906666408',NULL,'123456',NULL),(10,'www',NULL,'12345678912','111111','中国大陆','王林帆',NULL,NULL,NULL,NULL,'http://www.anta.com','18372623691',NULL,'111111',NULL);
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
  `shoplogo` varchar(255) DEFAULT NULL,
  `shoplink` varchar(50) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `password` varchar(25) NOT NULL,
  `energy` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `shopname` (`shopname`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personalShop`
--

LOCK TABLES `personalShop` WRITE;
/*!40000 ALTER TABLE `personalShop` DISABLE KEYS */;
INSERT INTO `personalShop` VALUES (1,'NIKE','运动服装','Just do it !','http://10.8.13.147:3000/upload/18372623690/nike.png','https://www.nike.com','18372623690',NULL,'123456',100),(2,'ADIDAS','运动服装','Nothing is impossible ！','http://10.8.13.147:3000/upload/18372623691/adidas.png','https://www.adidas.com.cn/','18372623691',NULL,'123456',120),(3,'乔丹','运动服装','I came, I conquer !','http://10.8.13.147:3000/upload/18372623692/jordan.png','http://www.qiaodan.com/','18372623692',NULL,'123456',10),(4,'李宁','运动服装','一切皆有可能！','http://10.8.13.147:3000/upload/18372623694/lining.png','http://www.lining.com/','18372623694',NULL,'123456',NULL),(5,'匹克','运动服装','I CAN PLAY!','http://10.8.13.147:3000/upload/18372623695/peak.png','http://www.peaksport.com/','18372623695',NULL,'123456',50),(6,'特步','运动服装','非一般的感觉！','http://10.8.13.147:3000/upload/13459238667/x.png','https://www.xtep.com','13459238667',NULL,'123456',20),(7,'卡帕','运动服装','WE ARE ONE!','http://10.8.13.147:3000/upload/15906666408/erke.png','http://www.ikappa.com.cn/','15906666408',NULL,'123456',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('135785678999','123434355654@qq.com','12345678',1,'',0,NULL),('13578567000','123434350000@qq.com','12340000',2,'',0,NULL),('13805976666','hello@163.com','123456',3,'cy',0,NULL),('13805976666','hello@163.com','123456',4,'ccy',0,NULL),('13805976666','hello@163.com','123456',5,'ccyy',0,NULL),('13805976666','hello@163.com','123456789',6,'ccyycy',0,NULL),('test','test','123456',7,'kebi',0,NULL),('test','test','123456',8,'wanglinfan',0,NULL),('test','test','12345678',9,'wangzhe',0,NULL),('test','test','12345678',10,'pinvonlin',0,NULL);
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

-- Dump completed on 2018-06-11 21:45:13
