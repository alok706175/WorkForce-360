package com.workforce360.service;

import com.workforce360.entity.Employee;
import com.workforce360.repository.EmployeeRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found with email: " + email));

        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + employee.getRole().name());

        return new CustomUserDetails(employee, Collections.singletonList(authority));
    }

    public static class CustomUserDetails implements UserDetails {
        private final Employee employee;
        private final Collection<? extends GrantedAuthority> authorities;

        public CustomUserDetails(Employee employee, Collection<? extends GrantedAuthority> authorities) {
            this.employee = employee;
            this.authorities = authorities;
        }

        public Employee getEmployee() {
            return employee;
        }

        public Long getId() {
            return employee.getId();
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public String getPassword() {
            return employee.getPassword();
        }

        @Override
        public String getUsername() {
            return employee.getEmail();
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}

