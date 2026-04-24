package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.agencia.crm.dto.call.CallRequest;
import pt.agencia.crm.dto.call.CallResponse;
import pt.agencia.crm.exception.ResourceNotFoundException;
import pt.agencia.crm.mapper.CallMapper;
import pt.agencia.crm.model.Call;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.CallResultado;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.repository.CallRepository;
import pt.agencia.crm.repository.ContactoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CallService {

    private final CallRepository callRepository;
    private final ContactoRepository contactoRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public CallResponse registar(CallRequest request) {
        Contacto contacto = contactoRepository.findById(request.contactoId())
                .orElseThrow(() -> new ResourceNotFoundException("Contacto", request.contactoId()));

        User caller = currentUserService.getCurrentUser();

        Call call = CallMapper.toEntity(request, contacto, caller);
        callRepository.save(call);

        contacto.setEstado(calcularNovoEstado(request.resultado()));
        contactoRepository.save(contacto);

        return CallMapper.toResponse(call);
    }

    public List<CallResponse> buscarPorContacto(Long contactoId) {
        return callRepository.findByContactoIdOrderByDataCallDesc(contactoId)
                .stream().map(CallMapper::toResponse).toList();
    }

    private ContactoEstado calcularNovoEstado(CallResultado resultado) {
        return switch (resultado) {
            case REUNIAO_MARCADA               -> ContactoEstado.REUNIAO_AGENDADA;
            case INTERESSADO, LIGACAO_AGENDADA -> ContactoEstado.FOLLOW_UP;
            case SEM_INTERESSE                 -> ContactoEstado.PERDIDO;
            case NAO_ATENDEU, RECUSOU          -> ContactoEstado.EM_CONTACTO;
        };
    }
}
