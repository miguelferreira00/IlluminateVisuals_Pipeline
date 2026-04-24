package pt.agencia.crm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.agencia.crm.dto.dashboard.CallsPorDiaResponse;
import pt.agencia.crm.dto.dashboard.DashboardKpisResponse;
import pt.agencia.crm.service.DashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    public DashboardKpisResponse kpis() {
        return dashboardService.kpis();
    }

    @GetMapping("/calls-por-dia")
    public List<CallsPorDiaResponse> callsPorDia() {
        return dashboardService.callsPorDia();
    }
}
