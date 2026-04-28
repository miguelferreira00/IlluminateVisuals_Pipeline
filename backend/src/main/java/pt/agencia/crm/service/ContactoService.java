package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.agencia.crm.dto.contacto.ContactoRequest;
import pt.agencia.crm.dto.contacto.ContactoResponse;
import pt.agencia.crm.dto.contacto.ContactoResumoResponse;
import pt.agencia.crm.exception.ResourceNotFoundException;
import pt.agencia.crm.mapper.ContactoMapper;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;
import pt.agencia.crm.repository.CallRepository;
import pt.agencia.crm.repository.ContactoRepository;
import pt.agencia.crm.repository.ContactoSpecification;
import pt.agencia.crm.repository.ReuniaoRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactoService {

    private final ContactoRepository contactoRepository;
    private final CallRepository callRepository;
    private final ReuniaoRepository reuniaoRepository;

    public Page<ContactoResumoResponse> listar(ContactoEstado estado, Setor setor, String search, Pageable pageable) {
        return contactoRepository
                .findAll(ContactoSpecification.filtrar(estado, setor, search), pageable)
                .map(ContactoMapper::toResumo);
    }

    public ContactoResponse buscarPorId(Long id) {
        return contactoRepository.findById(id)
                .map(ContactoMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Contacto", id));
    }

    @Transactional
    public ContactoResponse criar(ContactoRequest request) {
        Contacto contacto = ContactoMapper.toEntity(request);
        return ContactoMapper.toResponse(contactoRepository.save(contacto));
    }

    @Transactional
    public ContactoResponse atualizar(Long id, ContactoRequest request) {
        Contacto contacto = contactoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contacto", id));
        ContactoMapper.updateEntity(contacto, request);
        return ContactoMapper.toResponse(contactoRepository.save(contacto));
    }

    @Transactional
    public void eliminar(Long id) {
        Contacto contacto = contactoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contacto", id));
        callRepository.deleteAll(callRepository.findByContactoIdOrderByDataCallDesc(id));
        reuniaoRepository.deleteAll(reuniaoRepository.findByContacto_Id(id));
        contactoRepository.delete(contacto);
    }
}
