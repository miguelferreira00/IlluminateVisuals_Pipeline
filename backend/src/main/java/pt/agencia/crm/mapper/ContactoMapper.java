package pt.agencia.crm.mapper;

import pt.agencia.crm.dto.contacto.ContactoRequest;
import pt.agencia.crm.dto.contacto.ContactoResponse;
import pt.agencia.crm.dto.contacto.ContactoResumoResponse;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.enums.ContactoEstado;
import pt.agencia.crm.model.enums.Setor;

public class ContactoMapper {

    private ContactoMapper() {}

    public static ContactoResumoResponse toResumo(Contacto c) {
        return new ContactoResumoResponse(
                c.getId(),
                c.getEmpresa(),
                c.getSetor(),
                c.getNomeDecisor(),
                c.getCargo(),
                c.getTelefone(),
                c.getEstado(),
                c.getScorePotencial(),
                c.getAtualizadoEm()
        );
    }

    public static ContactoResponse toResponse(Contacto c) {
        return new ContactoResponse(
                c.getId(),
                c.getEmpresa(),
                c.getSetor(),
                c.getNomeDecisor(),
                c.getCargo(),
                c.getTelefone(),
                c.getEmail(),
                c.getLinkedinUrl(),
                c.getEstado(),
                c.getScorePotencial(),
                c.getNotas(),
                c.getCriadoEm(),
                c.getAtualizadoEm()
        );
    }

    public static Contacto toEntity(ContactoRequest r) {
        return Contacto.builder()
                .empresa(r.empresa())
                .setor(r.setor() != null ? r.setor() : Setor.OUTRO)
                .nomeDecisor(r.nomeDecisor())
                .cargo(r.cargo())
                .telefone(r.telefone())
                .email(r.email())
                .linkedinUrl(r.linkedinUrl())
                .estado(r.estado() != null ? r.estado() : ContactoEstado.NOVO)
                .scorePotencial(r.scorePotencial() != null ? r.scorePotencial() : 5)
                .notas(r.notas())
                .build();
    }

    public static void updateEntity(Contacto contacto, ContactoRequest r) {
        contacto.setEmpresa(r.empresa());
        contacto.setSetor(r.setor() != null ? r.setor() : Setor.OUTRO);
        contacto.setNomeDecisor(r.nomeDecisor());
        contacto.setCargo(r.cargo());
        contacto.setTelefone(r.telefone());
        contacto.setEmail(r.email());
        contacto.setLinkedinUrl(r.linkedinUrl());
        if (r.estado() != null)         contacto.setEstado(r.estado());
        if (r.scorePotencial() != null)  contacto.setScorePotencial(r.scorePotencial());
        contacto.setNotas(r.notas());
    }
}
