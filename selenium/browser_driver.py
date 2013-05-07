"""
Define a global driver to be reused when running tests
"""


DRIVER = None

def createDriver(driver):
    global DRIVER
    DRIVER = driver()

def getDriver():
    global DRIVER
    return DRIVER

def closeDriver():
    global DRIVER
    driver.quit()
