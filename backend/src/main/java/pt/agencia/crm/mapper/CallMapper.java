package pt.agencia.crm.mapper;

import pt.agencia.crm.dto.call.CallRequest;
import pt.agencia.crm.dto.call.CallResponse;
import pt.agencia.crm.model.Call;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.User;
import pt.agencia.crm.model.enums.CallProximoPasso;

public class CallMapper {

    private CallMapper() {}

    public static CallResponse toResponse(Call c) {
        return new CallResponse(
                c.getId(),
                ContactoMapper.toResumo(c.getContacto()),
                UserMapper.toResumo(c.getCallerUser()),
                c.getDataCall(),
                c.getResultado(),
                c.getProximoPasso(),
                c.getDataFollowUp(),
                c.getNotas(),
                c.getCriadoEm()
        );
    }

    public static Call toEntity(CallRequest r, Contacto contacto, User caller) {
        return Call.builder()
                .contacto(contacto)
                .callerUser(caller)
                .dataCall(r.dataCall())
                .resultado(r.resultado())
                .proximoPasso(r.proximoPasso() != null ? r.proximoPasso() : CallProximoPasso.NENHUM)
                .dataFollowUp(r.dataFollowUp())
                .notas(r.notas())
                .build();
    }
}
