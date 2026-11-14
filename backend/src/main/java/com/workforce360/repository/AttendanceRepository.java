package com.workforce360.repository;

import com.workforce360.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeIdOrderByDateDesc(Long employeeId);
    List<Attendance> findByDateOrderByEmployeeFullNameAsc(LocalDate date);
    List<Attendance> findAllByOrderByDateDesc();
    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
}

