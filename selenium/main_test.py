#!/usr/bin/python

import unittest
from selenium import webdriver

import browser_driver as driver


class TestUbuntuHomepage(unittest.TestCase):

    def setUp(self):
        self.browser = driver.getDriver()

    def testTitle(self):
        self.browser.get('localhost:8000')
        self.assertIn('LibrEE', self.browser.title)

    def tearDown(self):
        pass

if __name__ == '__main__':
    driver.createDriver(webdriver.Firefox)
    unittest.main(verbosity=2)

    print 'aff'
    driver.closeDriver()
