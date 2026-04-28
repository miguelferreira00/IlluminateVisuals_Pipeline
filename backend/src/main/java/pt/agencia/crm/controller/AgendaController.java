package pt.agencia.crm.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.agencia.crm.dto.agenda.SlotDisponivelResponse;
import pt.agencia.crm.service.GoogleCalendarService;

import java.util.List;

@RestController
@RequestMapping("/api/agenda")
@RequiredArgsConstructor
public class AgendaController {

    private final GoogleCalendarService googleCalendarService;

    @GetMapping("/slots")
    public List<SlotDisponivelResponse> slots(
            @RequestParam(defaultValue = "180") int dias,
            @RequestParam(defaultValue = "30") int duracaoMinutos,
            @RequestParam(required = false) Long adminId
    ) {
        return googleCalendarService.calcularSlotsLivres(dias, duracaoMinutos, adminId);
    }
}
