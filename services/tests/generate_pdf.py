#!/usr/bin/env python3
"""
Script to generate PDF documentation from LaTeX source
"""

import subprocess
import sys
import os

def check_latex_installed():
    """Check if pdflatex is installed"""
    try:
        subprocess.run(['pdflatex', '--version'], 
                      stdout=subprocess.DEVNULL, 
                      stderr=subprocess.DEVNULL)
        return True
    except FileNotFoundError:
        return False

def generate_pdf():
    """Generate PDF from LaTeX source"""
    # Change to the directory containing the .tex file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Check if pdflatex is installed
    if not check_latex_installed():
        print("Error: pdflatex not found. Please install a LaTeX distribution.")
        print("For Windows: Install MiKTeX or TeX Live")
        print("For macOS: Install MacTeX")
        print("For Linux: Install texlive-latex-base")
        return False
    
    try:
        # Run pdflatex twice to resolve references
        print("Generating PDF documentation...")
        subprocess.run(['pdflatex', '-interaction=nonstopmode', 'TESTING_GUIDE.tex'], 
                      check=True)
        subprocess.run(['pdflatex', '-interaction=nonstopmode', 'TESTING_GUIDE.tex'], 
                      check=True)
        
        print("PDF generated successfully: TESTING_GUIDE.pdf")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error generating PDF: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

def main():
    """Main function"""
    print("Fintech Microservices Testing Guide PDF Generator")
    print("=" * 50)
    
    success = generate_pdf()
    
    if success:
        print("\nDocumentation generated successfully!")
        print("You can find the PDF at:")
        print(os.path.join(os.path.dirname(os.path.abspath(__file__)), "TESTING_GUIDE.pdf"))
    else:
        print("\nFailed to generate PDF documentation.")
        print("Please check the error messages above.")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())