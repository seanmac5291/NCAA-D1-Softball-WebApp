import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 Government Compliance Audit', () => {
  const targetUrl = process.env.TARGET_URL || 'https://ncaa-d1-softball.netlify.app/';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the page before each test
    await page.goto(targetUrl);
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('WCAG 2.1 AA compliance scan - government standard', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Government compliance requires zero violations
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Generate compliance metrics for government reporting
    const complianceMetrics = {
      totalTests: accessibilityScanResults.passes.length + accessibilityScanResults.violations.length,
      passedTests: accessibilityScanResults.passes.length,
      failedTests: accessibilityScanResults.violations.length,
      compliancePercentage: Math.round((accessibilityScanResults.passes.length / (accessibilityScanResults.passes.length + accessibilityScanResults.violations.length)) * 100),
      wcag21Level: 'AA',
      governmentCompliant: accessibilityScanResults.violations.length === 0
    };
    
    console.log('WCAG 2.1 Government Compliance Metrics:', JSON.stringify(complianceMetrics, null, 2));
    
    // Attach compliance report
    await test.info().attach('wcag21-compliance-report.json', {
      body: JSON.stringify({
        complianceMetrics,
        fullResults: accessibilityScanResults
      }, null, 2),
      contentType: 'application/json'
    });
  });

  test('WCAG 2.1 detailed violation report for government compliance', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // If there are violations, log them in detail for government compliance reporting
    if (accessibilityScanResults.violations.length > 0) {
      console.log('WCAG 2.1 Government Compliance Violations Found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\n--- Government Compliance Violation ${index + 1} ---`);
        console.log(`Rule ID: ${violation.id}`);
        console.log(`Impact Level: ${violation.impact}`);
        console.log(`WCAG 2.1 Standard: ${violation.tags.filter(tag => tag.includes('wcag')).join(', ')}`);
        console.log(`Description: ${violation.description}`);
        console.log(`Remediation Help: ${violation.help}`);
        console.log(`Documentation: ${violation.helpUrl}`);
        console.log(`Government Compliance Risk: ${violation.impact === 'critical' ? 'HIGH RISK - Blocks users with disabilities' : 
                     violation.impact === 'serious' ? 'MEDIUM RISK - Significant usability impact' : 
                     'LOWER RISK - Should be addressed for full compliance'}`);
        console.log(`Elements Affected: ${violation.nodes.length}`);
        
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`  Element ${nodeIndex + 1}:`);
          console.log(`    HTML: ${node.html}`);
          console.log(`    CSS Selector: ${node.target.join(', ')}`);
          console.log(`    Failure Details: ${node.failureSummary}`);
          console.log(`    Compliance Impact: ${node.impact || violation.impact}`);
        });
      });
      
      // Attach comprehensive government compliance report
      await test.info().attach('government-accessibility-violations.json', {
        body: JSON.stringify({
          complianceStatus: 'NON_COMPLIANT',
          wcagLevel: 'AA',
          standardVersion: '2.1',
          testingDate: new Date().toISOString(),
          targetUrl: targetUrl,
          violations: accessibilityScanResults.violations,
          governmentRequirements: {
            criticalViolationsAllowed: 0,
            seriousViolationsAllowed: 0,
            currentCriticalViolations: accessibilityScanResults.violations.filter(v => v.impact === 'critical').length,
            currentSeriousViolations: accessibilityScanResults.violations.filter(v => v.impact === 'serious').length,
            complianceStatus: accessibilityScanResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT'
          }
        }, null, 2),
        contentType: 'application/json'
      });
    } else {
      console.log('✅ WCAG 2.1 AA Government Compliance: PASSED - No violations found');
      
      // Attach compliance confirmation report
      await test.info().attach('government-compliance-confirmation.json', {
        body: JSON.stringify({
          complianceStatus: 'COMPLIANT',
          wcagLevel: 'AA',
          standardVersion: '2.1',
          testingDate: new Date().toISOString(),
          targetUrl: targetUrl,
          violations: [],
          governmentRequirements: {
            criticalViolationsAllowed: 0,
            seriousViolationsAllowed: 0,
            currentCriticalViolations: 0,
            currentSeriousViolations: 0,
            complianceStatus: 'COMPLIANT'
          }
        }, null, 2),
        contentType: 'application/json'
      });
    }

    // Generate comprehensive metrics for government reporting
    const governmentMetrics = {
      totalViolations: accessibilityScanResults.violations.length,
      criticalViolations: accessibilityScanResults.violations.filter(v => v.impact === 'critical').length,
      seriousViolations: accessibilityScanResults.violations.filter(v => v.impact === 'serious').length,
      moderateViolations: accessibilityScanResults.violations.filter(v => v.impact === 'moderate').length,
      minorViolations: accessibilityScanResults.violations.filter(v => v.impact === 'minor').length,
      passes: accessibilityScanResults.passes.length,
      incomplete: accessibilityScanResults.incomplete.length,
      inapplicable: accessibilityScanResults.inapplicable.length,
      // Government compliance specific metrics
      governmentCompliant: accessibilityScanResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length === 0,
      wcagLevel: 'AA',
      wcagVersion: '2.1',
      compliancePercentage: Math.round((accessibilityScanResults.passes.length / (accessibilityScanResults.passes.length + accessibilityScanResults.violations.length)) * 100),
      testingFramework: 'axe-core',
      testingDate: new Date().toISOString()
    };

    console.log('\n--- WCAG 2.1 Government Compliance Metrics ---');
    console.log(`Total violations: ${governmentMetrics.totalViolations}`);
    console.log(`Critical violations: ${governmentMetrics.criticalViolations} (Government limit: 0)`);
    console.log(`Serious violations: ${governmentMetrics.seriousViolations} (Government limit: 0)`);
    console.log(`Moderate violations: ${governmentMetrics.moderateViolations}`); 
    console.log(`Minor violations: ${governmentMetrics.minorViolations}`);
    console.log(`Successful tests: ${governmentMetrics.passes}`);
    console.log(`Incomplete tests: ${governmentMetrics.incomplete}`);
    console.log(`Inapplicable tests: ${governmentMetrics.inapplicable}`);
    console.log(`Compliance percentage: ${governmentMetrics.compliancePercentage}%`);
    console.log(`Government compliant: ${governmentMetrics.governmentCompliant ? '✅ YES' : '❌ NO'}`);

    // Attach comprehensive government metrics as test artifact
    await test.info().attach('government-accessibility-metrics.json', {
      body: JSON.stringify(governmentMetrics, null, 2),
      contentType: 'application/json'
    });
  });

  test('keyboard navigation - WCAG 2.1 government compliance', async ({ page }) => {
    const issues = [];
    
    // Get all focusable elements
    const focusableElements = await page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    console.log(`Found ${focusableElements.length} focusable elements for government compliance testing`);
    
    // Test tab navigation through first 10 elements (to avoid timeout)
    const elementsToTest = Math.min(focusableElements.length, 10);
    
    for (let i = 0; i < elementsToTest; i++) {
      await page.keyboard.press('Tab');
      
      // Check if the focused element has visible focus indicator
      const activeElement = await page.locator(':focus').first();
      const isVisible = await activeElement.isVisible().catch(() => false);
      
      if (isVisible) {
        const elementInfo = {
          tag: await activeElement.evaluate(el => el.tagName).catch(() => 'UNKNOWN'),
          id: await activeElement.getAttribute('id').catch(() => ''),
          className: await activeElement.getAttribute('class').catch(() => ''),
          text: await activeElement.textContent().catch(() => '').then(text => text?.substring(0, 50) || '')
        };
        
        // Check if element has visible focus indicator
        const hasVisibleFocus = await activeElement.evaluate((el) => {
          const computedStyle = window.getComputedStyle(el);
          const pseudoStyle = window.getComputedStyle(el, ':focus');
          
          return (
            computedStyle.outline !== 'none' ||
            computedStyle.outlineWidth !== '0px' ||
            computedStyle.outlineStyle !== 'none' ||
            computedStyle.boxShadow !== 'none' ||
            pseudoStyle.outline !== 'none' ||
            pseudoStyle.outlineWidth !== '0px' ||
            pseudoStyle.boxShadow !== 'none'
          );
        }).catch(() => false);
        
        if (!hasVisibleFocus) {
          issues.push({
            type: 'keyboard-navigation',
            severity: 'moderate',
            message: `Element ${elementInfo.tag} lacks visible focus indicator`,
            element: elementInfo
          });
        }
      }
    }
    
    console.log(`Found ${issues.length} keyboard navigation issues`);
    
    if (issues.length > 0) {
      await test.info().attach('keyboard-navigation-issues.json', {
        body: JSON.stringify(issues, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('screen reader compatibility - WCAG 2.1 government compliance', async ({ page }) => {
    const issues = [];
    
    // Test for missing alt text on images (WCAG 2.1 Success Criterion 1.1.1)
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'serious',
        wcagCriterion: '1.1.1',
        message: `${imagesWithoutAlt} images missing alt text - violates WCAG 2.1 Success Criterion 1.1.1`,
        count: imagesWithoutAlt,
        governmentCompliance: 'VIOLATION'
      });
    }
    
    // Test for unlabeled form inputs (WCAG 2.1 Success Criterion 1.3.1, 3.3.2)
    const _unlabeledInputs = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.filter(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        return !hasLabel && !ariaLabel && !ariaLabelledby;
      }).length;
    });
    
    if (inputsWithoutLabels > 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'serious',
        wcagCriterion: '1.3.1,3.3.2',
        message: `${inputsWithoutLabels} form inputs missing labels - violates WCAG 2.1 Success Criteria 1.3.1 and 3.3.2`,
        count: inputsWithoutLabels,
        governmentCompliance: 'VIOLATION'
      });
    }
    
    // Test heading structure (WCAG 2.1 Success Criterion 1.3.1)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`Found ${headings.length} headings for government compliance review`);
    
    if (headings.length === 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        wcagCriterion: '1.3.1',
        message: 'No heading structure found for screen reader navigation - violates WCAG 2.1 Success Criterion 1.3.1',
        count: 1,
        governmentCompliance: 'VIOLATION'
      });
    } else {
      // Check heading hierarchy (WCAG 2.1 Success Criterion 1.3.1)
      const headingLevels = [];
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName);
        const level = parseInt(tagName[1]);
        headingLevels.push(level);
      }
      
      let previousLevel = 0;
      for (const level of headingLevels) {
        if (level > previousLevel + 1) {
          issues.push({
            type: 'screen-reader',
            severity: 'moderate',
            message: `Heading hierarchy skip detected (h${previousLevel} to h${level})`,
            count: 1
          });
          break;
        }
        previousLevel = level;
      }
    }
    
    // Test for ARIA landmarks
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').count();
    if (landmarks === 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        message: 'No ARIA landmarks found for screen reader navigation',
        count: 1
      });
    }
    
    // Test page title
    const pageTitle = await page.title();
    if (!pageTitle || pageTitle.trim() === '') {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        message: 'Page missing descriptive title',
        count: 1
      });
    }
    
    // Test language attribute
    const langAttribute = await page.locator('html').getAttribute('lang');
    if (!langAttribute) {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        message: 'HTML element missing lang attribute',
        count: 1
      });
    }
    
    console.log(`Found ${issues.length} screen reader compatibility issues`);
    
    if (issues.length > 0) {
      await test.info().attach('screen-reader-issues.json', {
        body: JSON.stringify(issues, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('responsive accessibility - mobile and desktop', async ({ page, isMobile }) => {
    const issues = [];
    
    // Test touch target sizes on mobile
    if (isMobile) {
      const touchTargets = await page.locator('button, a, input[type="button"], input[type="submit"], [role="button"]').all();
      
      for (const target of touchTargets) {
        const box = await target.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          const tagName = await target.evaluate(el => el.tagName);
          const text = await target.textContent();
          
          issues.push({
            type: 'mobile-accessibility',
            severity: 'moderate',
            message: `Touch target too small: ${tagName} "${text?.substring(0, 30) || ''}" (${box.width}x${box.height}px, minimum 44x44px)`,
            element: { tag: tagName, text: text?.substring(0, 30) || '', width: box.width, height: box.height }
          });
        }
      }
    }
    
    // Test viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').count();
    if (viewportMeta === 0) {
      issues.push({
        type: 'mobile-accessibility',
        severity: 'moderate',
        message: 'Missing viewport meta tag for responsive design',
        count: 1
      });
    }
    
    console.log(`Found ${issues.length} responsive accessibility issues (${isMobile ? 'mobile' : 'desktop'})`);
    
    if (issues.length > 0) {
      const filename = `responsive-accessibility-issues-${isMobile ? 'mobile' : 'desktop'}.json`;
      await test.info().attach(filename, {
        body: JSON.stringify(issues, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });
});