package pt.agencia.crm.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.agencia.crm.model.Call;
import pt.agencia.crm.model.Contacto;
import pt.agencia.crm.model.Reuniao;
import pt.agencia.crm.repository.CallRepository;
import pt.agencia.crm.repository.ContactoRepository;
import pt.agencia.crm.repository.ReuniaoRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExcelExportService {

    private final ContactoRepository contactoRepository;
    private final CallRepository callRepository;
    private final ReuniaoRepository reuniaoRepository;

    public byte[] gerarExcel() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = criarEstiloHeader(workbook);

            criarSheetPipeline(workbook, headerStyle);
            criarSheetCalls(workbook, headerStyle);
            criarSheetReunioes(workbook, headerStyle);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void criarSheetPipeline(XSSFWorkbook wb, CellStyle headerStyle) {
        Sheet sheet = wb.createSheet("Pipeline");
        String[] headers = {"ID", "Empresa", "Setor", "Decisor", "Cargo", "Telefone", "Email", "Estado", "Score", "Atualizado em"};
        criarHeader(sheet, headers, headerStyle);

        List<Contacto> contactos = contactoRepository.findAll();
        int rowNum = 1;
        for (Contacto c : contactos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(c.getId());
            row.createCell(1).setCellValue(nvl(c.getEmpresa()));
            row.createCell(2).setCellValue(c.getSetor() != null ? c.getSetor().name() : "");
            row.createCell(3).setCellValue(nvl(c.getNomeDecisor()));
            row.createCell(4).setCellValue(nvl(c.getCargo()));
            row.createCell(5).setCellValue(nvl(c.getTelefone()));
            row.createCell(6).setCellValue(nvl(c.getEmail()));
            row.createCell(7).setCellValue(c.getEstado() != null ? c.getEstado().name() : "");
            row.createCell(8).setCellValue(c.getScorePotencial());
            row.createCell(9).setCellValue(c.getAtualizadoEm() != null ? c.getAtualizadoEm().toString() : "");
        }
        autoSizeCols(sheet, headers.length);
    }

    private void criarSheetCalls(XSSFWorkbook wb, CellStyle headerStyle) {
        Sheet sheet = wb.createSheet("Histórico de Calls");
        String[] headers = {"ID", "Empresa", "Decisor", "Data Call", "Resultado", "Próximo Passo", "Follow-up", "Caller", "Notas"};
        criarHeader(sheet, headers, headerStyle);

        List<Call> calls = callRepository.findAll();
        int rowNum = 1;
        for (Call c : calls) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(c.getId());
            row.createCell(1).setCellValue(c.getContacto() != null ? nvl(c.getContacto().getEmpresa()) : "");
            row.createCell(2).setCellValue(c.getContacto() != null ? nvl(c.getContacto().getNomeDecisor()) : "");
            row.createCell(3).setCellValue(c.getDataCall() != null ? c.getDataCall().toString() : "");
            row.createCell(4).setCellValue(c.getResultado() != null ? c.getResultado().name() : "");
            row.createCell(5).setCellValue(c.getProximoPasso() != null ? c.getProximoPasso().name() : "");
            row.createCell(6).setCellValue(c.getDataFollowUp() != null ? c.getDataFollowUp().toString() : "");
            row.createCell(7).setCellValue(c.getCallerUser() != null ? nvl(c.getCallerUser().getNome()) : "");
            row.createCell(8).setCellValue(nvl(c.getNotas()));
        }
        autoSizeCols(sheet, headers.length);
    }

    private void criarSheetReunioes(XSSFWorkbook wb, CellStyle headerStyle) {
        Sheet sheet = wb.createSheet("Reuniões");
        String[] headers = {"ID", "Empresa", "Decisor", "Data Reunião", "Duração (min)", "Responsável", "Estado", "Google Event ID"};
        criarHeader(sheet, headers, headerStyle);

        List<Reuniao> reunioes = reuniaoRepository.findAll();
        int rowNum = 1;
        for (Reuniao r : reunioes) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(r.getId());
            row.createCell(1).setCellValue(r.getContacto() != null ? nvl(r.getContacto().getEmpresa()) : "");
            row.createCell(2).setCellValue(r.getContacto() != null ? nvl(r.getContacto().getNomeDecisor()) : "");
            row.createCell(3).setCellValue(r.getDataReuniao() != null ? r.getDataReuniao().toString() : "");
            row.createCell(4).setCellValue(r.getDuracaoMinutos());
            row.createCell(5).setCellValue(r.getResponsavel() != null ? nvl(r.getResponsavel().getNome()) : "");
            row.createCell(6).setCellValue(r.getEstado() != null ? r.getEstado().name() : "");
            row.createCell(7).setCellValue(nvl(r.getGoogleEventId()));
        }
        autoSizeCols(sheet, headers.length);
    }

    private void criarHeader(Sheet sheet, String[] headers, CellStyle style) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private CellStyle criarEstiloHeader(XSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void autoSizeCols(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) sheet.autoSizeColumn(i);
    }

    private String nvl(String val) {
        return val != null ? val : "";
    }
}
