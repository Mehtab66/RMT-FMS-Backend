-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: rpm_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alert_assignments`
--

DROP TABLE IF EXISTS `alert_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert_assignments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `alert_id` int unsigned DEFAULT NULL,
  `doctor_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_status` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alert_assignments_alert_id_foreign` (`alert_id`),
  KEY `alert_assignments_doctor_id_foreign` (`doctor_id`),
  CONSTRAINT `alert_assignments_alert_id_foreign` FOREIGN KEY (`alert_id`) REFERENCES `alerts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alert_assignments_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert_assignments`
--

LOCK TABLES `alert_assignments` WRITE;
/*!40000 ALTER TABLE `alert_assignments` DISABLE KEYS */;
INSERT INTO `alert_assignments` VALUES (29,36,11,'2025-10-01 06:50:43','2025-10-01 06:50:43',0,NULL),(30,37,11,'2025-10-01 06:56:32','2025-10-01 06:56:32',0,NULL),(31,38,11,'2025-10-01 09:17:21','2025-10-01 09:17:21',0,NULL),(32,39,11,'2025-10-01 09:18:08','2025-10-01 09:18:08',0,NULL),(33,40,11,'2025-10-01 09:18:33','2025-10-01 09:18:33',0,NULL),(34,41,11,'2025-10-01 09:19:01','2025-10-01 09:19:01',0,NULL),(35,42,11,'2025-10-01 09:19:17','2025-10-01 09:19:17',0,NULL),(36,43,11,'2025-10-01 09:20:59','2025-10-01 09:20:59',0,NULL),(37,44,11,'2025-10-01 09:25:15','2025-10-01 09:25:15',0,NULL),(38,45,11,'2025-10-01 10:48:22','2025-10-01 10:48:22',0,NULL);
/*!40000 ALTER TABLE `alert_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `desc` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
INSERT INTO `alerts` VALUES (36,'15','Patient 12 is in critical condition - urgent attention required','low','2025-10-01 06:50:43','2025-10-01 06:50:43'),(37,'15','Patient 12 is in critical condition - urgent attention required','low','2025-10-01 06:56:32','2025-10-01 06:56:32'),(38,'15','Patient 12 is in critical condition - urgent attention required','low','2025-10-01 09:17:21','2025-10-01 09:17:21'),(39,'15','Patient 12 is in critical condition - urgent attention required','low','2025-10-01 09:18:08','2025-10-01 09:18:08'),(40,'15','Patient 12 is in critical condition - urgent attention required','low','2025-10-01 09:18:33','2025-10-01 09:18:33'),(41,'15','Patient 12 is in critical condition - urgent attention required','low','2025-10-01 09:19:01','2025-10-01 09:19:01'),(42,'15','Patient 12 is in critical condition - urgent attention required','high','2025-10-01 09:19:17','2025-10-01 09:19:17'),(43,'15','Patient 12 is in critical condition - urgent attention required','high','2025-10-01 09:20:59','2025-10-01 09:20:59'),(44,'15','Patient 12 is in critical condition - urgent attention required','high','2025-10-01 09:25:15','2025-10-01 09:25:15'),(45,'15','Patient 12 is in critical condition - urgent attention required','high','2025-10-01 10:48:22','2025-10-01 10:48:22');
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dev_data`
--

DROP TABLE IF EXISTS `dev_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dev_data` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `dev_id` varchar(255) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dev_data`
--

LOCK TABLES `dev_data` WRITE;
/*!40000 ALTER TABLE `dev_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `dev_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `dev_type` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `devices_dev_type_unique` (`dev_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices_logs`
--

DROP TABLE IF EXISTS `devices_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `dev_id` varchar(255) NOT NULL,
  `desc` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices_logs`
--

LOCK TABLES `devices_logs` WRITE;
/*!40000 ALTER TABLE `devices_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knex_migrations`
--

DROP TABLE IF EXISTS `knex_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int DEFAULT NULL,
  `migration_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations`
--

LOCK TABLES `knex_migrations` WRITE;
/*!40000 ALTER TABLE `knex_migrations` DISABLE KEYS */;
INSERT INTO `knex_migrations` VALUES (1,'20250819123759_create_users_table.js',1,'2025-09-20 15:09:43'),(2,'20250819124249_create_role_table.js',1,'2025-09-20 15:09:43'),(3,'20250819124447_create_alert_table.js',1,'2025-09-20 15:09:43'),(4,'20250819124807_create_devices_table.js',1,'2025-09-20 15:09:43'),(5,'20250819125027_create_dev_logs_table.js',1,'2025-09-20 15:09:43'),(6,'20250819125116_create_dev_data_table.js',1,'2025-09-20 15:09:43'),(7,'20250819144413_add_status_to_users.js',1,'2025-09-20 15:09:43'),(8,'20250820112228_create_user_devices_table.js',1,'2025-09-20 15:09:43'),(9,'20250820113503_update_user_devices_for_email_mfa.js',1,'2025-09-20 15:09:43'),(10,'20250821063301_create_otp_tokens_table.js',1,'2025-09-20 15:09:44'),(11,'20250821131745_change_expires_at_to_timestamp.js',1,'2025-09-20 15:09:44'),(12,'20250822175301_alter_user_devices.js',1,'2025-09-20 15:09:44'),(13,'20250825131829_create_messages_table.js',1,'2025-09-20 15:09:44'),(14,'20250827070457_add_phoneNumber_to_users.js',1,'2025-09-20 15:09:44'),(15,'20250920155918_create_organizations_table.js',2,'2025-09-20 16:00:57'),(16,'20250920160014_add_org_to_users.js',2,'2025-09-20 16:00:57'),(17,'20250920160036_fix_role_user_relation.js',2,'2025-09-20 16:00:57'),(19,'20250924063655_add_is_deleted_to_organizations.js',3,'2025-09-26 07:08:49'),(20,'20250926062223_create_patient_doctor_assignments.js',4,'2025-09-26 07:09:34'),(21,'20250929062755_create_alert_assignments.js',5,'2025-09-29 06:28:29'),(22,'20250930093701_remove_alerts_type_unique.js',6,'2025-09-30 09:37:29'),(23,'20251001062836_add_read_status_to_alert_assignments.js',7,'2025-10-01 06:30:45'),(24,'20251001062942_add_read_status_to_alert_assignments.js',7,'2025-10-01 06:30:45');
/*!40000 ALTER TABLE `knex_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knex_migrations_lock`
--

DROP TABLE IF EXISTS `knex_migrations_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations_lock` (
  `index` int unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knex_migrations_lock`
--

LOCK TABLES `knex_migrations_lock` WRITE;
/*!40000 ALTER TABLE `knex_migrations_lock` DISABLE KEYS */;
INSERT INTO `knex_migrations_lock` VALUES (1,0);
/*!40000 ALTER TABLE `knex_migrations_lock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sender_id` int unsigned NOT NULL,
  `receiver_id` int unsigned NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `messages_receiver_id_foreign` (`receiver_id`),
  KEY `messages_sender_id_receiver_id_index` (`sender_id`,`receiver_id`),
  CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `org_code` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `organizations_org_code_unique` (`org_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'RMTs','RMTs','2025-09-26 04:17:43','2025-09-26 04:21:33',0),(2,'Comsats','CUI','2025-09-26 04:24:08','2025-09-26 04:24:08',0);
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_tokens`
--

DROP TABLE IF EXISTS `otp_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `otp_type` enum('login','mfa','password_reset') NOT NULL DEFAULT 'login',
  `expires_at` timestamp NOT NULL,
  `consumed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `otp_tokens_user_id_foreign` (`user_id`),
  CONSTRAINT `otp_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_tokens`
--

LOCK TABLES `otp_tokens` WRITE;
/*!40000 ALTER TABLE `otp_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_doctor_assignments`
--

DROP TABLE IF EXISTS `patient_doctor_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_doctor_assignments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` int unsigned NOT NULL,
  `doctor_id` int unsigned NOT NULL,
  `assigned_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_doctor_assignments_patient_id_foreign` (`patient_id`),
  KEY `patient_doctor_assignments_doctor_id_foreign` (`doctor_id`),
  KEY `patient_doctor_assignments_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `patient_doctor_assignments_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `patient_doctor_assignments_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `patient_doctor_assignments_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_doctor_assignments`
--

LOCK TABLES `patient_doctor_assignments` WRITE;
/*!40000 ALTER TABLE `patient_doctor_assignments` DISABLE KEYS */;
INSERT INTO `patient_doctor_assignments` VALUES (1,15,11,6,'2025-09-26 17:19:02'),(2,12,11,6,'2025-09-29 10:15:58'),(3,12,16,6,'2025-09-29 10:16:17');
/*!40000 ALTER TABLE `patient_doctor_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `role_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `role_user_id_foreign` (`user_id`),
  CONSTRAINT `role_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (6,'qamar',6,'admin','2025-09-26 04:21:16','2025-09-26 04:21:16'),(7,'mehtab',7,'admin','2025-09-26 04:24:08','2025-09-26 04:24:08'),(11,'wajhi1',11,'clinician','2025-09-26 15:28:38','2025-09-26 15:28:38'),(12,'bber',12,'patient','2025-09-26 16:40:50','2025-09-26 16:40:50'),(13,'qqqq',13,'patient','2025-09-26 16:59:12','2025-09-26 16:59:12'),(14,'qwerty',14,'patient','2025-09-26 17:17:34','2025-09-26 17:17:34'),(15,'qwertyre',15,'patient','2025-09-26 17:19:02','2025-09-26 17:19:02'),(16,'wajh',16,'clinician','2025-09-26 18:18:08','2025-09-26 18:18:08'),(17,'hammad',17,'super-admin','2025-09-30 04:31:15','2025-09-30 04:31:15');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_devices`
--

DROP TABLE IF EXISTS `user_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_devices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `device_fingerprint` varchar(512) NOT NULL,
  `ip_address` varchar(100) NOT NULL,
  `user_agent` varchar(512) NOT NULL,
  `refresh_token` varchar(512) DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `absolute_expires_at` timestamp NULL DEFAULT NULL,
  `revoked` tinyint(1) DEFAULT '0',
  `mfa_enabled` tinyint(1) DEFAULT '0',
  `mfa_secret` varchar(255) DEFAULT NULL,
  `mfa_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mfa_otp` varchar(6) DEFAULT NULL,
  `mfa_expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_devices_user_id_foreign` (`user_id`),
  CONSTRAINT `user_devices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_devices`
--

LOCK TABLES `user_devices` WRITE;
/*!40000 ALTER TABLE `user_devices` DISABLE KEYS */;
INSERT INTO `user_devices` VALUES (11,7,'unique-browser-hash','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzU4ODY1Nzc1LCJleHAiOjE3NjAwNzUzNzV9.pyMQjU2PdpfE3sKmK6im3v9JGHBJpv1Z0MtAwbX7oCA','2025-09-26 05:49:36','2025-09-26 05:49:36','2025-10-10 00:49:36',0,0,NULL,0,'2025-09-26 05:33:41','2025-09-26 05:49:36',NULL,NULL),(12,6,'unique-browser-hash','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzU5MzEwNDIxLCJleHAiOjE3NjA1MjAwMjF9.X-run21LcVzMQAq3rFjPT2Psvwg3Um_TQp8F3U3Jd1Y','2025-10-01 09:20:21','2025-10-01 09:20:21','2025-10-15 04:20:22',0,0,NULL,0,'2025-09-26 06:42:04','2025-10-01 09:20:21',NULL,NULL),(13,16,'unique-browser-hash','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc1ODkxMDcyMCwiZXhwIjoxNzYwMTIwMzIwfQ.IYf5HUtqJQGrqPoR-e76J-lhyxj-2Ja-985RkYKStL8','2025-09-26 18:18:40','2025-09-26 18:18:40','2025-10-10 13:18:41',0,0,NULL,0,'2025-09-26 18:18:40','2025-09-26 18:18:40',NULL,NULL),(15,17,'unique-browser-hash','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImlhdCI6MTc1OTIwNjcyMywiZXhwIjoxNzYwNDE2MzIzfQ.ZrDKvt9MNAp0gSfnmHyDEUHzOOGaic-5-MgYnx6OlS8','2025-09-30 04:32:03','2025-09-30 04:32:03','2025-10-13 23:32:03',0,0,NULL,0,'2025-09-30 04:32:03','2025-09-30 04:32:03',NULL,NULL),(17,11,'unique-browser-hash','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTc1OTM3NzkyMywiZXhwIjoxNzYwNTg3NTIzfQ.irQBHdyJvWqQWt7BeFtH9w5opJPtm-HggTh4H36UyBI','2025-10-02 04:05:23','2025-10-02 04:05:23','2025-10-15 23:05:24',0,0,NULL,0,'2025-10-01 10:54:19','2025-10-02 04:05:23',NULL,NULL);
/*!40000 ALTER TABLE `user_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `organization_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_organization_id_foreign` (`organization_id`),
  CONSTRAINT `users_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'qamar','qamar','qamar@gmail.com','$2b$12$I1nrZ6.0MRUqRBe0DIVLIubdq7CncxlUMSF14B/IPxXJVVzWRAru6','2025-09-26 04:21:16','2025-09-26 04:21:16',1,NULL,'+923430519849',1),(7,'mehtab','sohail','sohail1122@gmail.com','$2b$10$9Mxe2SZJlwgVJr2RvjxJmOjRusC2f8prgdF0xmi9SY96JBXrktGFC','2025-09-26 04:24:08','2025-09-26 05:59:29',1,NULL,'+923430519849',2),(11,'wajhi1','Wajahit','mm@gmail.com','$2b$10$st98/7xr5KaAc/KDF1XVhOAC87UmO43u7lgeSsq.y2AtGaoRj2gRW','2025-09-26 15:28:38','2025-09-29 10:38:24',1,NULL,'+9238748387',1),(12,'bber','bber mehmood','bbe@gmail.com','$2b$12$baVmVbmYkr0vKZxqDXrJre6iLh4sykyAOnPjnQAwEEiMr6SVmzl96','2025-09-26 16:40:49','2025-09-29 07:48:54',1,NULL,'+923430519849',1),(13,'qqqq','agvnt','tngyt@gmail.com','$2b$12$FxhuIZfwTaeBBwfP76.2A.IHZ/al1iFvr2A53r1nR9997nTX7xIPi','2025-09-26 16:59:12','2025-09-26 16:59:12',1,NULL,'+923430519849',1),(14,'qwerty','axser','q@gmail.com','$2b$12$ZQ/0U8PeJUd.6CRAYJdzauqt7N.afRFy7A41Ow4PjZTQCQp7g7Poy','2025-09-26 17:17:34','2025-09-26 17:17:34',1,NULL,'+923430519849',1),(15,'qwertyre','axser','wq@gmail.com','$2b$12$HG3eg/37NrFGkPv0lAjb/O/UsQ.uO7QAQ4Wx2E73bX4FWUgRe7Rgu','2025-09-26 17:19:02','2025-09-29 07:49:06',1,NULL,'+923430519849',1),(16,'wajh','wajhat','waj@gmail.com','$2b$12$2D5W7SkFMETy/ewMpevIh.sFtPMKBXk2XMjfgLu5hs7pkPaQAsaCO','2025-09-26 18:18:08','2025-09-26 18:18:08',1,NULL,'+923430519849',1),(17,'hammad','Test User','test@example.com','$2b$12$XDUoONCxNIRfRdntitVVSO2iPGldFE3AxMNmJtpJH4lYYVV9ZYFMa','2025-09-30 04:31:15','2025-09-30 04:31:15',1,NULL,'1234567890',NULL);
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

-- Dump completed on 2025-10-02 10:32:16
