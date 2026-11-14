package com.workforce360;

import com.workforce360.entity.*;
import com.workforce360.repository.AttendanceRepository;
import com.workforce360.repository.EmployeeRepository;
import com.workforce360.repository.LeaveRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@SpringBootApplication
public class WorkforceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkforceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            EmployeeRepository employeeRepository,
            LeaveRepository leaveRepository,
            AttendanceRepository attendanceRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (employeeRepository.count() == 0) {
                // 1. Seed Manager
                Employee manager = new Employee(
                        "Sarah Jenkins",
                        "manager@workforce360.com",
                        passwordEncoder.encode("Manager@123"),
                        Role.MANAGER,
                        "Operations & HR",
                        "Senior HR Operations Director",
                        25.0
                );
                employeeRepository.save(manager);

                // 2. Seed Employee 1
                Employee emp1 = new Employee(
                        "Alex Rivera",
                        "alex.rivera@workforce360.com",
                        passwordEncoder.encode("Employee@123"),
                        Role.EMPLOYEE,
                        "Engineering",
                        "Full Stack Software Engineer",
                        18.0
                );
                employeeRepository.save(emp1);

                // 3. Seed Employee 2
                Employee emp2 = new Employee(
                        "Priya Sharma",
                        "priya.sharma@workforce360.com",
                        passwordEncoder.encode("Employee@123"),
                        Role.EMPLOYEE,
                        "Product Design",
                        "Lead UI/UX Designer",
                        16.0
                );
                employeeRepository.save(emp2);

                // 4. Seed Employee 3
                Employee emp3 = new Employee(
                        "Michael Chang",
                        "michael.chang@workforce360.com",
                        passwordEncoder.encode("Employee@123"),
                        Role.EMPLOYEE,
                        "Quality Assurance",
                        "Senior QA Automation Engineer",
                        14.0
                );
                employeeRepository.save(emp3);

                // Seed sample leaves for demonstration
                LocalDate today = LocalDate.now();
                leaveRepository.save(new LeaveRequest(
                        emp1,
                        LeaveType.CASUAL,
                        today.plusDays(2),
                        today.plusDays(3),
                        2.0,
                        "Family gathering and personal commitments",
                        false,
                        null
                ));

                leaveRepository.save(new LeaveRequest(
                        emp2,
                        LeaveType.SICK,
                        today.plusDays(5),
                        today.plusDays(6),
                        2.0,
                        "Medical appointment and recovery",
                        false,
                        null
                ));

                LeaveRequest pastLeave = new LeaveRequest(
                        emp1,
                        LeaveType.ANNUAL,
                        today.minusDays(15),
                        today.minusDays(13),
                        3.0,
                        "Annual family vacation",
                        false,
                        null
                );
                pastLeave.setStatus(LeaveStatus.APPROVED);
                leaveRepository.save(pastLeave);

                // Seed sample attendance logs
                attendanceRepository.save(new Attendance(emp1, today, AttendanceStatus.PRESENT));
                attendanceRepository.save(new Attendance(emp2, today, AttendanceStatus.PRESENT));
                attendanceRepository.save(new Attendance(emp3, today, AttendanceStatus.HALF_DAY));
                attendanceRepository.save(new Attendance(manager, today, AttendanceStatus.PRESENT));

                // Yesterday's attendance
                attendanceRepository.save(new Attendance(emp1, today.minusDays(1), AttendanceStatus.PRESENT));
                attendanceRepository.save(new Attendance(emp2, today.minusDays(1), AttendanceStatus.PRESENT));
                attendanceRepository.save(new Attendance(emp3, today.minusDays(1), AttendanceStatus.ABSENT));

                System.out.println(">>> Sample seed data successfully populated for WorkForce 360!");
                System.out.println("    Manager: manager@workforce360.com / Manager@123");
                System.out.println("    Employee: alex.rivera@workforce360.com / Employee@123");
            }
        };
    }
}

