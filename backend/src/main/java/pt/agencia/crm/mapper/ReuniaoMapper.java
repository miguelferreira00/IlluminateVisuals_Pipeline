package pt.agencia.crm.mapper;

import pt.agencia.crm.dto.reuniao.ReuniaoRequest;
import pt.agencia.crm.dto.reuniao.ReuniaoResponse;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.model.User;

public class ReuniaoMapper {

    private ReuniaoMapper() {}

    public static ReuniaoResponse toResponse(Reuniao r) {
        return new ReuniaoResponse(
                r.getId(),
                ContactoMapper.toResumo(r.getContacto()),
                r.getGoogleEventId(),
                r.getDataReuniao(),
                r.getDuracaoMinutos(),
                UserMapper.toResumo(r.getResponsavel()),
                UserMapper.toResumo(r.getCriadoPor()),
                r.getEstado(),
                r.getNotas(),
                r.getCriadoEm()
        );
    }

    public static Reuniao toEntity(ReuniaoRequest r, Contacto contacto, User responsavel, User criadoPor) {
        return Reuniao.builder()
                .contacto(contacto)
                .dataReuniao(r.dataReuniao())
                .duracaoMinutos(r.duracaoMinutos() != null ? r.duracaoMinutos() : 30)
                .responsavel(responsavel)
                .criadoPor(criadoPor)
                .notas(r.notas())
                .build();
    }
}
