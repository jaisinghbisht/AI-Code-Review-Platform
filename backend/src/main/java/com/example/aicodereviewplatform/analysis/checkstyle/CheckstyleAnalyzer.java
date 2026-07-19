package com.example.aicodereviewplatform.analysis.checkstyle;

import com.example.aicodereviewplatform.analysis.model.FileAnalysis;
import com.puppycrawl.tools.checkstyle.Checker;
import com.puppycrawl.tools.checkstyle.ConfigurationLoader;
import com.puppycrawl.tools.checkstyle.PropertiesExpander;
import com.puppycrawl.tools.checkstyle.api.AuditListener;
import com.puppycrawl.tools.checkstyle.api.CheckstyleException;
import com.puppycrawl.tools.checkstyle.api.Configuration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CheckstyleAnalyzer {

    public void analyze(List<FileAnalysis> fileAnalyses, Path projectRoot) {
        try {
            // Load Google checks configuration
            Configuration config = ConfigurationLoader.loadConfiguration(
                    "com/puppycrawl/tools/checkstyle/checks/google_checks.xml",
                    new PropertiesExpander(new Properties())
            );
            
            Checker checker = new Checker();
            checker.setModuleClassLoader(Checker.class.getClassLoader());
            checker.configure(config);

            AuditListener listener = new CheckstyleListener(fileAnalyses);
            checker.addListener(listener);

            List<File> filesToProcess = fileAnalyses.stream()
                    .map(fa -> new File(fa.getFilePath()))
                    .collect(Collectors.toList());

            // Process the files
            checker.process(filesToProcess);
            checker.destroy();

        } catch (CheckstyleException e) {
            log.error("Error running Checkstyle analysis", e);
        }
    }
}
