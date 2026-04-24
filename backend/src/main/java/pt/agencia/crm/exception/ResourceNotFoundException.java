package pt.agencia.crm.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String recurso, Long id) {
        super(recurso + " com id " + id + " não encontrado");
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
