package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.agencia.crm.dto.reuniao.ReuniaoRequest;
import pt.agencia.crm.dto.reuniao.ReuniaoResponse;
import pt.agencia.crm.exception.ResourceNotFoundException;
import pt.agencia.crm.mapper.ReuniaoMapper;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.ReuniaoEstado;
import pt.agencia.crm.repository.ContactoRepository;
import pt.agencia.crm.repository.ReuniaoRepository;
import pt.agencia.crm.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReuniaoService {

    private final ReuniaoRepository reuniaoRepository;
    private final ContactoRepository contactoRepository;
    private final UserRepository userRepository;
    private final GoogleCalendarService googleCalendarService;

    @Transactional
    public ReuniaoResponse criar(ReuniaoRequest request) {
        Contacto contacto = contactoRepository.findById(request.contactoId())
                .orElseThrow(() -> new ResourceNotFoundException("Contacto", request.contactoId()));

        User responsavel = null;
        if (request.responsavelUserId() != null) {
            responsavel = userRepository.findById(request.responsavelUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilizador", request.responsavelUserId()));
        }

        Reuniao reuniao = ReuniaoMapper.toEntity(request, contacto, responsavel);

        // Tenta criar evento no Google Calendar — falha silenciosa se token não existir
        if (responsavel != null && responsavel.getGoogleCalendarToken() != null) {
            String eventId = googleCalendarService.criarEvento(reuniao, responsavel);
            reuniao.setGoogleEventId(eventId);
        }

        contacto.setEstado(ContactoEstado.REUNIAO_AGENDADA);
        contactoRepository.save(contacto);

        return ReuniaoMapper.toResponse(reuniaoRepository.save(reuniao));
    }

    public List<ReuniaoResponse> listar() {
        return reuniaoRepository.findByEstadoOrderByDataReuniaoAsc(ReuniaoEstado.AGENDADA)
                .stream().map(ReuniaoMapper::toResponse).toList();
    }
}
