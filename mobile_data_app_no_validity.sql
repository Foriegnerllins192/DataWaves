-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 10, 2025 at 06:30 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `mobile_data_app`
--
CREATE DATABASE IF NOT EXISTS `mobile_data_app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `mobile_data_app`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@example.com', '$2b$10$vE8tjD6u7aO9pLz5nK4rO.XmG9zF2H1qY3sW8eB0cD7fE6gA5hI4i', '+233123456789', 'admin', '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(2, 'John Doe', 'john@example.com', '$2b$10$vE8tjD6u7aO9pLz5nK4rO.XmG9zF2H1qY3sW8eB0cD7fE6gA5hI4i', '+233987654321', 'user', '2025-11-10 06:00:00', '2025-11-10 06:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `data_plans`
--

CREATE TABLE `data_plans` (
  `id` int(11) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `size` varchar(20) NOT NULL COMMENT 'Size in GB',
  `price` decimal(10,2) NOT NULL COMMENT 'Base price in GHC',
  `custom` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `data_plans`
--

INSERT INTO `data_plans` (`id`, `provider`, `size`, `price`, `custom`, `created_at`, `updated_at`) VALUES
(1, 'mtn', '1', 5.50, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(2, 'mtn', '3', 8.50, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(3, 'mtn', '5', 15.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(4, 'mtn', '10', 25.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(5, 'mtn', '15', 35.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(6, 'mtn', '25', 60.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(7, 'telecel', '3', 12.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(8, 'telecel', '5', 18.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(9, 'telecel', '10', 28.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(10, 'telecel', '15', 38.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(11, 'airteltigo', '1', 4.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(12, 'airteltigo', '3', 13.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
(13, 'airteltigo', '5', 20.00, 0, '2025-11-10 06:00:00', '2025-11-10 06:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `network` varchar(50) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_reference` varchar(100) DEFAULT NULL,
  `aggregator_response` text DEFAULT NULL,
  `confirmation_method` enum('sms','email') DEFAULT NULL,
  `confirmation_contact` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `plan_id`, `network`, `phone_number`, `amount`, `status`, `payment_reference`, `aggregator_response`, `confirmation_method`, `confirmation_contact`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'mtn', '+233123456789', 5.50, 'success', 'ref_123456789', '{"status":"success","transactionId":"tx_987654321"}', NULL, NULL, '2025-11-10 06:15:00', '2025-11-10 06:15:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `data_plans`
--
ALTER TABLE `data_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `data_plans`
--
ALTER TABLE `data_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `data_plans` (`id`) ON DELETE CASCADE;
COMMIT;